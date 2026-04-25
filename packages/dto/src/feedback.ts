export type FeedbackCategory = "bug" | "idea" | "praise" | "other";

export interface FeedbackDTO {
  id: string;
  category: FeedbackCategory;
  message: string;
  rating: number | null;
  createdAt: string;
}
