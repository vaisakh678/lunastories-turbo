import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { userSchema } from "./users";

export const fileSchema = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  storageKey: text("storage_key").notNull().unique(),
  contentType: varchar("content_type", { length: 64 }).notNull(),
  uploadedBy: uuid("uploaded_by").references(() => userSchema.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type FileRow = typeof fileSchema.$inferSelect;
export type NewFileRow = typeof fileSchema.$inferInsert;
