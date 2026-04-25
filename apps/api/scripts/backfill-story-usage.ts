/**
 * Backfill text/audio usage counts on existing stories so the admin cost
 * dashboard isn't blank for rows generated before usage tracking was added.
 *
 * Heuristics (we can't recover real OpenAI usage after the fact):
 *   - text_output_tokens ≈ ceil(body_text.length / 4)   (~4 chars/token English avg)
 *   - audio_input_chars  = body_text.length             (exactly what TTS got)
 *   - text_input_tokens  is left untouched — we don't have the original prompt
 *
 * Only fills columns that are currently NULL — won't overwrite real data.
 *
 * Run:
 *   pnpm -C apps/api tsx scripts/backfill-story-usage.ts
 */

import db, { storySchema } from "@repo/db";
import { and, eq, isNotNull, isNull, or } from "drizzle-orm";

import "../src/config/env";

async function main() {
  const rows = await db
    .select({
      id: storySchema.id,
      bodyText: storySchema.bodyText,
      audioStorageKey: storySchema.audioStorageKey,
      textOutputTokens: storySchema.textOutputTokens,
      audioInputChars: storySchema.audioInputChars,
    })
    .from(storySchema)
    .where(
      and(
        isNotNull(storySchema.bodyText),
        or(
          isNull(storySchema.textOutputTokens),
          isNull(storySchema.audioInputChars),
        ),
      ),
    );

  console.log(`Found ${rows.length} stories with missing usage counts.`);

  let updated = 0;
  for (const row of rows) {
    if (!row.bodyText) continue;

    const set: Record<string, number> = {};
    if (row.textOutputTokens === null) {
      set.textOutputTokens = Math.max(1, Math.ceil(row.bodyText.length / 4));
    }
    if (row.audioInputChars === null && row.audioStorageKey !== null) {
      set.audioInputChars = row.bodyText.length;
    }

    if (Object.keys(set).length === 0) continue;

    await db.update(storySchema).set(set).where(eq(storySchema.id, row.id));
    updated += 1;
    console.log(`  ${row.id}: ${JSON.stringify(set)}`);
  }

  console.log(`\nDone. Updated ${updated} of ${rows.length} stories.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
