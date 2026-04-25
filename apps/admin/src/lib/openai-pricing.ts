// Approximate OpenAI rates as of writing — verify on https://openai.com/api/pricing
const TEXT_INPUT_USD_PER_1M = 0.15; // gpt-4o-mini input tokens
const TEXT_OUTPUT_USD_PER_1M = 0.6; // gpt-4o-mini output tokens
const TTS_TEXT_INPUT_USD_PER_1M = 0.6; // gpt-4o-mini-tts text input tokens
const TTS_AUDIO_OUTPUT_USD_PER_1M = 12; // gpt-4o-mini-tts audio output tokens

// Rough heuristics for the things OpenAI doesn't return directly:
const CHARS_PER_TOKEN = 4; // average for English prose
// OpenAI publishes ~$0.015/min for gpt-4o-mini-tts audio. At $12/1M tokens,
// ($0.015 / 60s) / ($12 / 1_000_000) ≈ 20.8 tokens/sec.
const AUDIO_TOKENS_PER_SECOND = 20.8;

export interface StoryUsage {
  textInputTokens: number | null;
  textOutputTokens: number | null;
  audioInputChars: number | null;
  durationSeconds: number | null;
}

export interface CostBreakdown {
  textInputUsd: number;
  textOutputUsd: number;
  ttsTextInputUsd: number;
  ttsAudioOutputUsd: number;
  totalUsd: number;
}

export function estimateStoryCost(usage: StoryUsage): CostBreakdown {
  const textInputUsd =
    ((usage.textInputTokens ?? 0) / 1_000_000) * TEXT_INPUT_USD_PER_1M;
  const textOutputUsd =
    ((usage.textOutputTokens ?? 0) / 1_000_000) * TEXT_OUTPUT_USD_PER_1M;

  const ttsInputTokens = (usage.audioInputChars ?? 0) / CHARS_PER_TOKEN;
  const ttsOutputTokens =
    (usage.durationSeconds ?? 0) * AUDIO_TOKENS_PER_SECOND;

  const ttsTextInputUsd =
    (ttsInputTokens / 1_000_000) * TTS_TEXT_INPUT_USD_PER_1M;
  const ttsAudioOutputUsd =
    (ttsOutputTokens / 1_000_000) * TTS_AUDIO_OUTPUT_USD_PER_1M;

  return {
    textInputUsd,
    textOutputUsd,
    ttsTextInputUsd,
    ttsAudioOutputUsd,
    totalUsd: textInputUsd + textOutputUsd + ttsTextInputUsd + ttsAudioOutputUsd,
  };
}

export function formatUsd(amount: number): string {
  if (amount === 0) return "$0";
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  return `$${amount.toFixed(3)}`;
}
