import { z } from "zod";

export const feedbackCategorySchema = z.enum([
  "bug",
  "idea",
  "praise",
  "other",
]);

export const createFeedbackSchema = z.object({
  category: feedbackCategorySchema,
  message: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
});

export type FeedbackCategory = z.infer<typeof feedbackCategorySchema>;
export type CreateFeedback = z.infer<typeof createFeedbackSchema>;
