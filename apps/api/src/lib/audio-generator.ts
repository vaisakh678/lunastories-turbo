import OpenAI from "openai";

import { env } from "../config/env";

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const NARRATION_INSTRUCTIONS =
  "Warm, gentle bedtime narrator for a young child. Speak slowly and softly, " +
  "with a calm, sleepy cadence. Pause briefly at paragraph breaks.";

const WORDS_PER_MINUTE = 150;

export interface GeneratedAudio {
  buffer: Buffer;
  durationSeconds: number;
  inputChars: number;
  contentType: "audio/mpeg";
}

export async function generateAudio(bodyText: string): Promise<GeneratedAudio> {
  const speech = await client.audio.speech.create({
    model: env.OPENAI_TTS_MODEL,
    voice: env.OPENAI_TTS_VOICE,
    input: bodyText,
    instructions: NARRATION_INSTRUCTIONS,
    response_format: "mp3",
  });

  const buffer = Buffer.from(await speech.arrayBuffer());
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  const durationSeconds = Math.max(1, Math.ceil((wordCount / WORDS_PER_MINUTE) * 60));

  return {
    buffer,
    durationSeconds,
    inputChars: bodyText.length,
    contentType: "audio/mpeg",
  };
}
