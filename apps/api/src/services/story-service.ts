import db, {
  characterSchema,
  storyCharacterSchema,
  storySchema,
} from "@repo/db";
import type {
  CharacterDTO,
  StoryContent,
  StoryDTO,
  StorySummaryDTO,
} from "@repo/dto";
import type { CreateStory } from "@repo/zod";
import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";

import { BadRequest, InternalError, NotFound } from "../lib/api-error";
import { generateAudio } from "../lib/audio-generator";
import { logger } from "../lib/logger";
import { presignAudio, uploadAudio } from "../lib/storage";
import { generateStory } from "../lib/story-generator";

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
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function toDTO(
  row: typeof storySchema.$inferSelect,
  characterIds: string[],
): Promise<StoryDTO> {
  const audioUrl = row.audioStorageKey
    ? await presignAudio(row.audioStorageKey)
    : null;
  return {
    ...toSummaryDTO(row),
    characterIds,
    generationInput: (row.generationInput ?? {}) as Record<string, unknown>,
    content: (row.content ?? null) as StoryContent | null,
    bodyText: row.bodyText,
    audioUrl,
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

export async function getStoriesByUser(
  userId: string,
): Promise<StorySummaryDTO[]> {
  const rows = await db
    .select()
    .from(storySchema)
    .where(
      and(eq(storySchema.userId, userId), isNull(storySchema.deletedAt)),
    )
    .orderBy(desc(storySchema.createdAt));

  return rows.map(toSummaryDTO);
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
  const key = `stories/${storyId}.mp3`;
  await uploadAudio(key, audio.buffer, audio.contentType);

  const [updated] = await db
    .update(storySchema)
    .set({
      audioStorageKey: key,
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
