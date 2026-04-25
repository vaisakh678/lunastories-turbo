import type { CharacterDTO, StoryBlock, StoryContent } from "@repo/dto";
import OpenAI from "openai";

import { env } from "../config/env";
import { logger } from "./logger";

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export interface GeneratedStory {
  title: string;
  summary: string;
  bodyText: string;
  content: StoryContent;
  coverSymbol: string;
  coverTint: string;
  textInputTokens: number;
  textOutputTokens: number;
}

export interface GenerateStoryArgs {
  characters: CharacterDTO[];
  modeKey: string;
  input: Record<string, unknown>;
}

const MODE_COVERS: Record<string, { symbol: string; tint: string }> = {
  creative: { symbol: "paintpalette.fill", tint: "pink" },
  inventors: { symbol: "lightbulb.fill", tint: "yellow" },
  construction_site: { symbol: "hammer.fill", tint: "orange" },
  vegetable: { symbol: "leaf.fill", tint: "green" },
  environment: { symbol: "globe.americas.fill", tint: "blue" },
  jungle_book: { symbol: "pawprint.fill", tint: "brown" },
  alice_in_wonderland: { symbol: "cup.and.saucer.fill", tint: "purple" },
  grimms_tales: { symbol: "book.closed.fill", tint: "indigo" },
  wizard_of_oz: { symbol: "tornado", tint: "teal" },
};

const SYSTEM_PROMPT = `You are a children's bedtime storyteller for kids ages 3 to 8.
Write short, gentle, hopeful stories (around 300 to 500 words) suited to be read aloud at bedtime.
Use simple language, sensory details, and warm character interactions.
Avoid violence, scary themes, romance, and complex vocabulary.
Always end on a calm, peaceful note that helps a child wind down for sleep.`;

function describeCharacters(characters: CharacterDTO[]): string {
  return characters
    .map((c, i) => {
      const traits = [
        c.age != null ? `age ${c.age}` : null,
        c.gender && c.gender !== "na" ? c.gender : null,
        c.hairColor ? `${c.hairColor} hair` : null,
        c.eyeColor ? `${c.eyeColor} eyes` : null,
        c.hairstyle ? `${c.hairstyle} hairstyle` : null,
      ].filter(Boolean);
      const interests = c.interests.length
        ? `loves ${c.interests.join(", ")}`
        : null;
      const note = c.extraInterestNote.trim() || null;
      const role = c.role === "main" ? "main character" : "side character";
      return [
        `${i + 1}. ${c.name} (${role})`,
        traits.length ? `   - ${traits.join(", ")}` : null,
        interests ? `   - ${interests}` : null,
        note ? `   - extra: ${note}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");
}

function buildUserPrompt(args: GenerateStoryArgs): string {
  return `Write a bedtime story for the "${args.modeKey}" theme.

Characters:
${describeCharacters(args.characters)}

Theme inputs (JSON):
${JSON.stringify(args.input, null, 2)}

Return JSON with:
- "title": short, evocative title (max 60 characters)
- "summary": one-sentence pitch (max 160 characters)
- "body_text": the full story prose, with paragraphs separated by blank lines.`;
}

function paragraphsToBlocks(bodyText: string): StoryBlock[] {
  return bodyText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((text) => ({ kind: "text", text }));
}

export async function generateStory(
  args: GenerateStoryArgs,
): Promise<GeneratedStory> {
  const response = await client.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(args) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "story",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["title", "summary", "body_text"],
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            body_text: { type: "string" },
          },
        },
      },
    },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    logger.error({ response }, "OpenAI returned empty story content");
    throw new Error("Empty response from OpenAI");
  }

  let parsed: { title: string; summary: string; body_text: string };
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    logger.error({ err, raw }, "Failed to parse OpenAI story JSON");
    throw new Error("Malformed story response from OpenAI");
  }

  const cover = MODE_COVERS[args.modeKey] ?? {
    symbol: "book.fill",
    tint: "blue",
  };

  return {
    title: parsed.title,
    summary: parsed.summary,
    bodyText: parsed.body_text,
    content: { blocks: paragraphsToBlocks(parsed.body_text) },
    coverSymbol: cover.symbol,
    coverTint: cover.tint,
    textInputTokens: response.usage?.prompt_tokens ?? 0,
    textOutputTokens: response.usage?.completion_tokens ?? 0,
  };
}
