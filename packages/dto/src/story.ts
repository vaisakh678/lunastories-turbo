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
  createdAt: string;
  updatedAt: string;
}

export interface StoryDTO extends StorySummaryDTO {
  characterIds: string[];
  generationInput: Record<string, unknown>;
  content: StoryContent | null;
  bodyText: string | null;
  audioUrl: string | null;
  errorMessage: string | null;
}
