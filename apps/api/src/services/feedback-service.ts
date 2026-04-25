import db, { feedbackSchema } from "@repo/db";
import type { FeedbackDTO } from "@repo/dto";
import type { CreateFeedback } from "@repo/zod";

function toDTO(row: typeof feedbackSchema.$inferSelect): FeedbackDTO {
  return {
    id: row.id,
    category: row.category,
    message: row.message,
    rating: row.rating,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createFeedback(
  userId: string,
  data: CreateFeedback,
): Promise<FeedbackDTO> {
  const [created] = await db
    .insert(feedbackSchema)
    .values({
      userId,
      category: data.category,
      message: data.message,
      rating: data.rating ?? null,
    })
    .returning();

  return toDTO(created);
}
