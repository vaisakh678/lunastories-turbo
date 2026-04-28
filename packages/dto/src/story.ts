import type { FileRefDTO } from "./file";

export type StoryStatus = "pending" | "generating" | "ready" | "failed";

export type StoryBlock =
  | { kind: "text"; text: string }
  | { kind: "illustration"; symbolName: string; tint: string };

export interface StoryContent {
  blocks: StoryBlock[];
}

export interface StorySummaryDTO {
  id: string;
  status: StoryStatus;
  modeKey: string;
  title: string | null;
  summary: string | null;
  coverSymbol: string | null;
  coverTint: string | null;
  durationSeconds: number | null;
  textInputTokens: number | null;
  textOutputTokens: number | null;
  audioInputChars: number | null;
  lastReadAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoryDTO extends StorySummaryDTO {
  characterIds: string[];
  generationInput: Record<string, unknown>;
  content: StoryContent | null;
  bodyText: string | null;
  audio: FileRefDTO | null;
  errorMessage: string | null;
  textInputTokens: number | null;
  textOutputTokens: number | null;
  audioInputChars: number | null;
}
