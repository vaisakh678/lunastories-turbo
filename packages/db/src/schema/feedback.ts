import {
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { feedbackCategoryEnum } from "./enums";
import { userSchema } from "./users";

export const feedbackSchema = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userSchema.id, { onDelete: "cascade" }),
  category: feedbackCategoryEnum("category").notNull(),
  message: text("message").notNull(),
  rating: smallint("rating"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Feedback = typeof feedbackSchema.$inferSelect;
export type NewFeedback = typeof feedbackSchema.$inferInsert;
