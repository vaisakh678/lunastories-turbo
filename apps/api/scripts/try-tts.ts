/**
 * Generate a sample TTS clip to evaluate voice + instructions.
 *
 * Usage:
 *   pnpm -C apps/api tsx scripts/try-tts.ts                       # defaults
 *   pnpm -C apps/api tsx scripts/try-tts.ts shimmer
 *   pnpm -C apps/api tsx scripts/try-tts.ts coral "Whisper softly, like a lullaby."
 *
 * Voices: alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer, verse
 */

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import "../src/config/env";
import OpenAI from "openai";

import { env } from "../src/config/env";

const SAMPLE_TEXT = `
Milo woke up to a soft humming sound. Outside his window, the moon was singing
a song made of cinnamon and stardust.

He tiptoed to the sill, climbed onto a cloud-shaped stool, and reached for the
night sky. In his hand he held a tiny moon cookie, warm and round, with sugar
sprinkled like little stars.

"One bite for courage," he whispered, "and one for wishes." The cookie giggled.

That night Milo dreamed of cinnamon clouds, jumping over them all the way until
morning.
`.trim();

const DEFAULT_INSTRUCTIONS =
  "Warm, gentle bedtime narrator for a young child. Speak slowly and softly, " +
  "with a calm, sleepy cadence. Pause briefly at paragraph breaks.";

async function main() {
  const voice = (process.argv[2] ?? "shimmer") as
    | "alloy" | "ash" | "ballad" | "coral" | "echo"
    | "fable" | "nova" | "onyx" | "sage" | "shimmer" | "verse";
  const instructions = process.argv[3] ?? DEFAULT_INSTRUCTIONS;

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  console.log(`Generating ${voice} sample…`);
  const start = Date.now();

  const speech = await client.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice,
    input: SAMPLE_TEXT,
    instructions,
    response_format: "mp3",
  });

  const buffer = Buffer.from(await speech.arrayBuffer());
  const outPath = resolve(process.cwd(), `tts-sample-${voice}.mp3`);
  await writeFile(outPath, buffer);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Wrote ${outPath} (${(buffer.byteLength / 1024).toFixed(0)} KB, ${elapsed}s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
