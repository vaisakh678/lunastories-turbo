import db, {
  characterSchema,
  storyCharacterSchema,
  storySchema,
} from "@repo/db";
import type {
  CharacterDTO,
  CursorPagedResponse,
  StoryContent,
  StoryDTO,
  StorySummaryDTO,
} from "@repo/dto";
import type { CreateStory, StoryListQuery } from "@repo/zod";
import { and, asc, desc, eq, gte, inArray, isNull, lt } from "drizzle-orm";

import { BadRequest, InternalError, NotFound } from "../lib/api-error";
import { generateAudio } from "../lib/audio-generator";
import { logger } from "../lib/logger";
import { sendStoryReadyNotification } from "../lib/onesignal";
import { generateStory } from "../lib/story-generator";
import { fileRefFor, uploadFile } from "./file-service";

function toSummaryDTO(row: typeof storySchema.$inferSelect): StorySummaryDTO {
  return {
    id: row.id,
    status: row.status,
    modeKey: row.modeKey,
    title: row.title,
    summary: row.summary,
    coverSymbol: row.coverSymbol,
    coverTint: row.coverTint,
    durationSeconds: row.durationSeconds,
    textInputTokens: row.textInputTokens,
    textOutputTokens: row.textOutputTokens,
    audioInputChars: row.audioInputChars,
    lastReadAt: row.lastReadAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function toDTO(
  row: typeof storySchema.$inferSelect,
  characterIds: string[],
): Promise<StoryDTO> {
  const audio = row.audioFileId ? await fileRefFor(row.audioFileId) : null;
  return {
    ...toSummaryDTO(row),
    characterIds,
    generationInput: (row.generationInput ?? {}) as Record<string, unknown>,
    content: (row.content ?? null) as StoryContent | null,
    bodyText: row.bodyText,
    audio,
    errorMessage: row.errorMessage,
    textInputTokens: row.textInputTokens,
    textOutputTokens: row.textOutputTokens,
    audioInputChars: row.audioInputChars,
  };
}

function characterRowToDTO(
  row: typeof characterSchema.$inferSelect,
): CharacterDTO {
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    symbolName: row.symbolName,
    tint: row.tint,
    tagline: row.tagline,
    age: row.age,
    gender: row.gender,
    hairColor: row.hairColor,
    eyeColor: row.eyeColor,
    hairstyle: row.hairstyle,
    interests: row.interests,
    extraInterestNote: row.extraInterestNote,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createStory(
  userId: string,
  data: CreateStory,
): Promise<StoryDTO> {
  const ownedCharacters = await db
    .select()
    .from(characterSchema)
    .where(
      and(
        eq(characterSchema.userId, userId),
        inArray(characterSchema.id, data.characterIds),
        isNull(characterSchema.deletedAt),
      ),
    );

  if (ownedCharacters.length !== data.characterIds.length) {
    throw BadRequest("One or more characters do not belong to this user");
  }

  const orderedCharacters = data.characterIds.map(
    (id) => ownedCharacters.find((c) => c.id === id)!,
  );

  const insertedId = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(storySchema)
      .values({
        userId,
        modeKey: data.modeKey,
        generationInput: data.input,
        status: "generating",
      })
      .returning({ id: storySchema.id });

    await tx.insert(storyCharacterSchema).values(
      data.characterIds.map((characterId, position) => ({
        storyId: created.id,
        characterId,
        position,
      })),
    );

    return created.id;
  });

  try {
    const generated = await generateStory({
      characters: orderedCharacters.map(characterRowToDTO),
      modeKey: data.modeKey,
      input: data.input,
    });

    const [updated] = await db
      .update(storySchema)
      .set({
        status: "ready",
        title: generated.title,
        summary: generated.summary,
        bodyText: generated.bodyText,
        content: generated.content,
        coverSymbol: generated.coverSymbol,
        coverTint: generated.coverTint,
        textInputTokens: generated.textInputTokens,
        textOutputTokens: generated.textOutputTokens,
      })
      .where(eq(storySchema.id, insertedId))
      .returning();

    // Fire-and-forget push so a OneSignal hiccup doesn't fail the request.
    void sendStoryReadyNotification({
      userId,
      storyId: updated.id,
      title: updated.title,
    });

    return toDTO(updated, data.characterIds);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    await db
      .update(storySchema)
      .set({ status: "failed", errorMessage: message })
      .where(eq(storySchema.id, insertedId));

    logger.error({ err, storyId: insertedId }, "Story generation failed");
    throw InternalError("Failed to generate story");
  }
}

/// The most recent ready-but-unread story created in the last 48 hours,
/// or null if there is none. Powers the "Pick up where you left off"
/// banner on the home screen.
const UNREAD_BANNER_WINDOW_HOURS = 48;

export async function getLatestUnreadStory(
  userId: string,
): Promise<StorySummaryDTO | null> {
  const cutoff = new Date(
    Date.now() - UNREAD_BANNER_WINDOW_HOURS * 60 * 60 * 1000,
  );

  const [row] = await db
    .select()
    .from(storySchema)
    .where(
      and(
        eq(storySchema.userId, userId),
        isNull(storySchema.deletedAt),
        isNull(storySchema.lastReadAt),
        eq(storySchema.status, "ready"),
        gte(storySchema.createdAt, cutoff),
      ),
    )
    .orderBy(desc(storySchema.createdAt))
    .limit(1);

  return row ? toSummaryDTO(row) : null;
}

export async function getStoriesByUser(
  userId: string,
  query: StoryListQuery,
): Promise<CursorPagedResponse<StorySummaryDTO>> {
  const { cursor, limit } = query;

  let cursorCreatedAt: Date | undefined;
  if (cursor) {
    const [pivot] = await db
      .select({ createdAt: storySchema.createdAt })
      .from(storySchema)
      .where(eq(storySchema.id, cursor))
      .limit(1);
    if (pivot) cursorCreatedAt = pivot.createdAt;
  }

  const conditions = [
    eq(storySchema.userId, userId),
    isNull(storySchema.deletedAt),
    cursorCreatedAt ? lt(storySchema.createdAt, cursorCreatedAt) : undefined,
  ].filter((c) => c !== undefined);

  const rows = await db
    .select()
    .from(storySchema)
    .where(and(...conditions))
    .orderBy(desc(storySchema.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit).map(toSummaryDTO);
  const nextCursor = hasMore ? items[items.length - 1]!.id : null;

  return { items, nextCursor };
}

export async function getStoryById(
  userId: string,
  storyId: string,
): Promise<StoryDTO> {
  const [row] = await db
    .select()
    .from(storySchema)
    .where(
      and(
        eq(storySchema.id, storyId),
        eq(storySchema.userId, userId),
        isNull(storySchema.deletedAt),
      ),
    )
    .limit(1);

  if (!row) throw NotFound("Story not found");

  const links = await db
    .select({ characterId: storyCharacterSchema.characterId })
    .from(storyCharacterSchema)
    .where(eq(storyCharacterSchema.storyId, storyId))
    .orderBy(asc(storyCharacterSchema.position));

  return toDTO(row, links.map((l) => l.characterId));
}

export async function generateStoryAudio(
  userId: string,
  storyId: string,
): Promise<StoryDTO> {
  const [row] = await db
    .select()
    .from(storySchema)
    .where(
      and(
        eq(storySchema.id, storyId),
        eq(storySchema.userId, userId),
        isNull(storySchema.deletedAt),
      ),
    )
    .limit(1);

  if (!row) throw NotFound("Story not found");
  if (row.status !== "ready") {
    throw BadRequest("Story isn't ready yet");
  }
  if (!row.bodyText) {
    throw BadRequest("Story has no body text to narrate");
  }

  const audio = await generateAudio(row.bodyText);
  const key = `files/${crypto.randomUUID()}.mp3`;
  const file = await uploadFile({
    buffer: audio.buffer,
    contentType: audio.contentType,
    storageKey: key,
  });

  const [updated] = await db
    .update(storySchema)
    .set({
      audioFileId: file.id,
      durationSeconds: audio.durationSeconds,
      audioInputChars: audio.inputChars,
    })
    .where(eq(storySchema.id, storyId))
    .returning();

  const links = await db
    .select({ characterId: storyCharacterSchema.characterId })
    .from(storyCharacterSchema)
    .where(eq(storyCharacterSchema.storyId, storyId))
    .orderBy(asc(storyCharacterSchema.position));

  return toDTO(
    updated,
    links.map((l) => l.characterId),
  );
}

export async function softDeleteStory(
  userId: string,
  storyId: string,
): Promise<void> {
  const [deleted] = await db
    .update(storySchema)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(storySchema.id, storyId),
        eq(storySchema.userId, userId),
        isNull(storySchema.deletedAt),
      ),
    )
    .returning({ id: storySchema.id });

  if (!deleted) throw NotFound("Story not found");
}

/// Stamp the story as opened by the user. Idempotent — only sets
/// `lastReadAt` the first time, so we keep the original "first opened"
/// moment. Subsequent reads are a no-op.
export async function markStoryAsRead(
  userId: string,
  storyId: string,
): Promise<{ id: string; lastReadAt: string }> {
  const [updated] = await db
    .update(storySchema)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(storySchema.id, storyId),
        eq(storySchema.userId, userId),
        isNull(storySchema.deletedAt),
        isNull(storySchema.lastReadAt),
      ),
    )
    .returning({ id: storySchema.id, lastReadAt: storySchema.lastReadAt });

  if (updated && updated.lastReadAt) {
    return { id: updated.id, lastReadAt: updated.lastReadAt.toISOString() };
  }

  // Already read — fetch the existing timestamp so the caller can use it.
  const [existing] = await db
    .select({ id: storySchema.id, lastReadAt: storySchema.lastReadAt })
    .from(storySchema)
    .where(
      and(
        eq(storySchema.id, storyId),
        eq(storySchema.userId, userId),
        isNull(storySchema.deletedAt),
      ),
    )
    .limit(1);

  if (!existing) throw NotFound("Story not found");

  return {
    id: existing.id,
    lastReadAt: existing.lastReadAt?.toISOString() ?? new Date().toISOString(),
  };
}
