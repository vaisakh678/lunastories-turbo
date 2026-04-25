import { z } from "zod";

export const storyStatusSchema = z.enum([
  "pending",
  "generating",
  "ready",
  "failed",
]);

export const createStorySchema = z.object({
  modeKey: z.string().min(1).max(64),
  characterIds: z.array(z.string().uuid()).min(1).max(8),
  input: z.record(z.unknown()).default({}),
});

export type StoryStatus = z.infer<typeof storyStatusSchema>;
export type CreateStory = z.infer<typeof createStorySchema>;
