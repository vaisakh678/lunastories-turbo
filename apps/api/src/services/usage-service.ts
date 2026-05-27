import db, { storySchema } from "@repo/db";
import type { GenerationUsageDTO, UsageSummaryDTO } from "@repo/dto";
import { and, eq, gte, sql, type AnyColumn } from "drizzle-orm";

import { MAX_AUDIO_PER_WEEK, MAX_STORIES_PER_WEEK } from "../config/limits";
import { BadRequest } from "../lib/api-error";

// Start of the current weekly window: the most recent Saturday at 00:00.
// dow is Sun=0 … Sat=6, so days since Saturday = (dow + 1) % 7.
const WEEK_START = sql`(date_trunc('day', now()) - ((extract(dow from now())::int + 1) % 7) * interval '1 day')`;

async function usageFor(
  userId: string,
  windowColumn: AnyColumn,
  total: number,
  noun: string,
): Promise<GenerationUsageDTO> {
  const [row] = await db
    .select({
      used: sql<number>`count(*)::int`,
      // Epoch seconds (float8) — node-postgres parses this to a JS number,
      // avoiding the timestamptz string/Date ambiguity of a raw sql expression
      // (which came back as a string and broke .toISOString()).
      resetEpoch: sql<number>`extract(epoch from (${WEEK_START} + interval '7 days'))`,
    })
    .from(storySchema)
    .where(and(eq(storySchema.userId, userId), gte(windowColumn, WEEK_START)));

  const used = row?.used ?? 0;
  const remaining = Math.max(0, total - used);
  const percentUsed = total > 0 ? Math.round((used / total) * 100) : 0;
  const resetsAt = new Date((row?.resetEpoch ?? Date.now() / 1000) * 1000);
  return {
    used,
    total,
    remaining,
    percentUsed,
    resetsAt: resetsAt.toISOString(),
    message: `${remaining} of ${total} ${noun} left this week`,
  };
}

/** Story-generation usage for the current week (counted by created_at). */
export function storyUsage(userId: string): Promise<GenerationUsageDTO> {
  return usageFor(userId, storySchema.createdAt, MAX_STORIES_PER_WEEK, "stories");
}

/** Audio-narration usage for the current week (counted by audio_generated_at). */
export function audioUsage(userId: string): Promise<GenerationUsageDTO> {
  return usageFor(
    userId,
    storySchema.audioGeneratedAt,
    MAX_AUDIO_PER_WEEK,
    "audio narrations",
  );
}

/** Both quotas at once — for GET /usage. */
export async function usageSummary(userId: string): Promise<UsageSummaryDTO> {
  const [stories, audio] = await Promise.all([
    storyUsage(userId),
    audioUsage(userId),
  ]);
  return { stories, audio };
}

/** Throws 400 (with usage in meta) if the weekly story cap is reached. */
export async function assertStoryQuota(userId: string): Promise<void> {
  const usage = await storyUsage(userId);
  if (usage.remaining <= 0) {
    throw BadRequest(
      `You've reached your limit of ${usage.total} stories this week. It resets Saturday.`,
      { usage },
    );
  }
}

/** Throws 400 (with usage in meta) if the weekly audio cap is reached. */
export async function assertAudioQuota(userId: string): Promise<void> {
  const usage = await audioUsage(userId);
  if (usage.remaining <= 0) {
    throw BadRequest(
      `You've reached your limit of ${usage.total} audio narrations this week. It resets Saturday.`,
      { usage },
    );
  }
}
