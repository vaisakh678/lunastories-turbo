/**
 * Seed character_avatars from PNGs in docs/assets/characters/.
 * Filenames are already UUIDs, so we use each filename as the row id
 * — re-running the script is a no-op for files that are already seeded.
 *
 * Run:
 *   pnpm --filter api exec tsx scripts/seed-avatars.ts
 */

import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

import db, { characterAvatarSchema } from "@repo/db";
import { eq } from "drizzle-orm";

import "../src/config/env";
import { uploadObject } from "../src/lib/storage";

const SOURCE_DIR = resolve(
  import.meta.dirname,
  "../../../docs/assets/characters",
);

function uuidFromFilename(name: string): string | null {
  const base = name.replace(/\.png$/i, "");
  const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return re.test(base) ? base.toLowerCase() : null;
}

async function main() {
  const entries = await readdir(SOURCE_DIR);
  const candidates = entries
    .filter((f) => f.toLowerCase().endsWith(".png"))
    .map((f) => ({ filename: f, id: uuidFromFilename(f) }))
    .filter((c): c is { filename: string; id: string } => c.id !== null);

  console.log(`Found ${candidates.length} avatar PNGs in ${SOURCE_DIR}`);

  let inserted = 0;
  let skipped = 0;
  for (const { filename, id } of candidates) {
    const [existing] = await db
      .select({ id: characterAvatarSchema.id })
      .from(characterAvatarSchema)
      .where(eq(characterAvatarSchema.id, id))
      .limit(1);

    if (existing) {
      skipped += 1;
      console.log(`  skip ${id} (already exists)`);
      continue;
    }

    const buffer = await readFile(resolve(SOURCE_DIR, filename));
    const key = `avatars/${id}.png`;

    await uploadObject(key, buffer, "image/png");
    await db.insert(characterAvatarSchema).values({
      id,
      name: null,
      storageKey: key,
    });

    inserted += 1;
    console.log(`  ok   ${id} (${(buffer.byteLength / 1024).toFixed(0)} KB → ${key})`);
  }

  console.log(`\nDone. Inserted ${inserted}, skipped ${skipped}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
