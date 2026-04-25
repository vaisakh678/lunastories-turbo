import db, {
  characterSchema,
  feedbackSchema,
  storySchema,
  userSchema,
} from "@repo/db";
import type {
  AdminStatsDTO,
  AdminUserDTO,
  CharacterDTO,
  FeedbackDTO,
  PagedResponse,
  StoryDTO,
  StorySummaryDTO,
  UserDTO,
} from "@repo/dto";
import type { AdminListQuery, AdminStoryListQuery } from "@repo/zod";
import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";

import { NotFound } from "../lib/api-error";
import { presignAudio } from "../lib/storage";

function userRowToDTO(row: typeof userSchema.$inferSelect): UserDTO {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    emailVerified: row.emailVerified,
    createdAt: (row.createdAt ?? new Date()).toISOString(),
  };
}

export async function listUsersAdmin(
  query: AdminListQuery,
): Promise<PagedResponse<UserDTO>> {
  const { page, perPage, search } = query;
  const offset = (page - 1) * perPage;
  const where = search
    ? or(
        ilike(userSchema.email, `%${search}%`),
        ilike(userSchema.name, `%${search}%`),
      )
    : undefined;

  const rows = await db
    .select()
    .from(userSchema)
    .where(where)
    .orderBy(desc(userSchema.createdAt))
    .limit(perPage)
    .offset(offset);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(userSchema)
    .where(where);

  return {
    items: rows.map(userRowToDTO),
    meta: { total, page, perPage },
  };
}

export async function getUserAdmin(userId: string): Promise<AdminUserDTO> {
  const [row] = await db
    .select()
    .from(userSchema)
    .where(eq(userSchema.id, userId))
    .limit(1);

  if (!row) throw NotFound("User not found");

  const [{ value: storyCount }] = await db
    .select({ value: count() })
    .from(storySchema)
    .where(
      and(eq(storySchema.userId, userId), isNull(storySchema.deletedAt)),
    );

  const [{ value: characterCount }] = await db
    .select({ value: count() })
    .from(characterSchema)
    .where(
      and(
        eq(characterSchema.userId, userId),
        isNull(characterSchema.deletedAt),
      ),
    );

  return {
    ...userRowToDTO(row),
    clerkId: row.clerkId,
    storyCount,
    characterCount,
  };
}

function storyRowToSummary(
  row: typeof storySchema.$inferSelect,
): StorySummaryDTO {
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

export async function listStoriesAdmin(
  query: AdminStoryListQuery,
): Promise<PagedResponse<StorySummaryDTO & { userId: string }>> {
  const { page, perPage, search, status, modeKey } = query;
  const offset = (page - 1) * perPage;
  const conditions = [
    isNull(storySchema.deletedAt),
    status ? eq(storySchema.status, status) : undefined,
    modeKey ? eq(storySchema.modeKey, modeKey) : undefined,
    search
      ? or(
          ilike(storySchema.title, `%${search}%`),
          ilike(storySchema.summary, `%${search}%`),
        )
      : undefined,
  ].filter((c) => c !== undefined);
  const where = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(storySchema)
    .where(where)
    .orderBy(desc(storySchema.createdAt))
    .limit(perPage)
    .offset(offset);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(storySchema)
    .where(where);

  return {
    items: rows.map((row) => ({
      ...storyRowToSummary(row),
      userId: row.userId,
    })),
    meta: { total, page, perPage },
  };
}

export async function getStoryAdmin(storyId: string): Promise<StoryDTO> {
  const [row] = await db
    .select()
    .from(storySchema)
    .where(eq(storySchema.id, storyId))
    .limit(1);

  if (!row) throw NotFound("Story not found");

  const audioUrl = row.audioStorageKey
    ? await presignAudio(row.audioStorageKey)
    : null;

  return {
    ...storyRowToSummary(row),
    characterIds: [],
    generationInput: (row.generationInput ?? {}) as Record<string, unknown>,
    content: row.content as StoryDTO["content"],
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

export async function listCharactersAdmin(
  query: AdminListQuery,
): Promise<PagedResponse<CharacterDTO & { userId: string }>> {
  const { page, perPage, search } = query;
  const offset = (page - 1) * perPage;
  const conditions = [
    isNull(characterSchema.deletedAt),
    search ? ilike(characterSchema.name, `%${search}%`) : undefined,
  ].filter((c) => c !== undefined);
  const where = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(characterSchema)
    .where(where)
    .orderBy(desc(characterSchema.createdAt))
    .limit(perPage)
    .offset(offset);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(characterSchema)
    .where(where);

  return {
    items: rows.map((row) => ({
      ...characterRowToDTO(row),
      userId: row.userId,
    })),
    meta: { total, page, perPage },
  };
}

export async function listFeedbackAdmin(
  query: AdminListQuery,
): Promise<PagedResponse<FeedbackDTO & { userId: string }>> {
  const { page, perPage, search } = query;
  const offset = (page - 1) * perPage;
  const where = search
    ? ilike(feedbackSchema.message, `%${search}%`)
    : undefined;

  const rows = await db
    .select()
    .from(feedbackSchema)
    .where(where)
    .orderBy(desc(feedbackSchema.createdAt))
    .limit(perPage)
    .offset(offset);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(feedbackSchema)
    .where(where);

  return {
    items: rows.map((row) => ({
      id: row.id,
      category: row.category,
      message: row.message,
      rating: row.rating,
      createdAt: row.createdAt.toISOString(),
      userId: row.userId,
    })),
    meta: { total, page, perPage },
  };
}

export async function getStatsAdmin(): Promise<AdminStatsDTO> {
  const [{ value: totalUsers }] = await db
    .select({ value: count() })
    .from(userSchema)
    .where(isNull(userSchema.deletedAt));

  const [{ value: totalCharacters }] = await db
    .select({ value: count() })
    .from(characterSchema)
    .where(isNull(characterSchema.deletedAt));

  const [{ value: totalStories }] = await db
    .select({ value: count() })
    .from(storySchema)
    .where(isNull(storySchema.deletedAt));

  const statusRows = await db
    .select({
      status: storySchema.status,
      value: count(),
    })
    .from(storySchema)
    .where(isNull(storySchema.deletedAt))
    .groupBy(storySchema.status);

  const storiesByStatus = {
    pending: 0,
    generating: 0,
    ready: 0,
    failed: 0,
  };
  for (const row of statusRows) {
    storiesByStatus[row.status] = row.value;
  }

  const [{ value: totalFeedback }] = await db
    .select({ value: count() })
    .from(feedbackSchema);

  return {
    totalUsers,
    totalCharacters,
    totalStories,
    storiesByStatus,
    totalFeedback,
  };
}
