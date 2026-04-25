import {
  integer,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { characterSchema } from "./characters";
import { storyStatusEnum } from "./enums";
import { userSchema } from "./users";

export const storySchema = pgTable("stories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userSchema.id, { onDelete: "cascade" }),

  modeKey: varchar("mode_key", { length: 64 }).notNull(),
  status: storyStatusEnum("status").notNull().default("pending"),
  errorMessage: text("error_message"),

  title: varchar("title", { length: 255 }),
  summary: text("summary"),
  coverSymbol: varchar("cover_symbol", { length: 64 }),
  coverTint: varchar("cover_tint", { length: 32 }),

  generationInput: jsonb("generation_input").notNull().default({}),
  content: jsonb("content"),
  bodyText: text("body_text"),

  audioUrl: text("audio_url"),
  durationSeconds: integer("duration_seconds"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const storyCharacterSchema = pgTable(
  "story_characters",
  {
    storyId: uuid("story_id")
      .notNull()
      .references(() => storySchema.id, { onDelete: "cascade" }),
    characterId: uuid("character_id")
      .notNull()
      .references(() => characterSchema.id, { onDelete: "cascade" }),
    position: smallint("position").notNull(),
  },
  (t) => [primaryKey({ columns: [t.storyId, t.characterId] })],
);

export type Story = typeof storySchema.$inferSelect;
export type NewStory = typeof storySchema.$inferInsert;
