import db, { storySchema } from "@repo/db";
import { and, eq, gte, sql } from "drizzle-orm";

import { MAX_AUDIO_PER_WEEK, MAX_STORIES_PER_MONTH } from "../config/limits";
import { BadRequest } from "../lib/api-error";

/** Stories the user has generated since the start of the current month. */
async function storiesThisMonth(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(storySchema)
    .where(
      and(
        eq(storySchema.userId, userId),
        // Count every generation, including ones later soft-deleted — the
        // generation cost was already incurred.
        gte(storySchema.createdAt, sql`date_trunc('month', now())`),
      ),
    );
  return row?.count ?? 0;
}

/** Narrations the user has generated since the start of the current week. */
async function audioThisWeek(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(storySchema)
    .where(
      and(
        eq(storySchema.userId, userId),
        gte(storySchema.audioGeneratedAt, sql`date_trunc('week', now())`),
      ),
    );
  return row?.count ?? 0;
}

/** Throws 400 if the user has hit the monthly story-generation cap. */
export async function assertStoryQuota(userId: string): Promise<void> {
  if ((await storiesThisMonth(userId)) >= MAX_STORIES_PER_MONTH) {
    throw BadRequest(
      `You've reached your limit of ${MAX_STORIES_PER_MONTH} stories this month. It resets at the start of next month.`,
    );
  }
}

/** Throws 400 if the user has hit the weekly audio-generation cap. */
export async function assertAudioQuota(userId: string): Promise<void> {
  if ((await audioThisWeek(userId)) >= MAX_AUDIO_PER_WEEK) {
    throw BadRequest(
      `You've reached your limit of ${MAX_AUDIO_PER_WEEK} audio narrations this week. It resets on Monday.`,
    );
  }
}
