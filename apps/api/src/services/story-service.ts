import db, {
  characterSchema,
  storyCharacterSchema,
  storySchema,
} from "@repo/db";
import type {
  StoryContent,
  StoryDTO,
  StorySummaryDTO,
} from "@repo/dto";
import type { CreateStory } from "@repo/zod";
import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";

import { BadRequest, NotFound } from "../lib/api-error";

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
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toDTO(
  row: typeof storySchema.$inferSelect,
  characterIds: string[],
): StoryDTO {
  return {
    ...toSummaryDTO(row),
    characterIds,
    generationInput: (row.generationInput ?? {}) as Record<string, unknown>,
    content: (row.content ?? null) as StoryContent | null,
    bodyText: row.bodyText,
    audioUrl: row.audioUrl,
    errorMessage: row.errorMessage,
  };
}

export async function createStory(
  userId: string,
  data: CreateStory,
): Promise<StoryDTO> {
  const ownedCharacters = await db
    .select({ id: characterSchema.id })
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

  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(storySchema)
      .values({
        userId,
        modeKey: data.modeKey,
        generationInput: data.input,
      })
      .returning();

    await tx.insert(storyCharacterSchema).values(
      data.characterIds.map((characterId, position) => ({
        storyId: created.id,
        characterId,
        position,
      })),
    );

    return toDTO(created, data.characterIds);
  });
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
