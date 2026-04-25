import {
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { characterRoleEnum, genderEnum } from "./enums";
import { userSchema } from "./users";

export const characterSchema = pgTable("characters", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userSchema.id, { onDelete: "cascade" }),

  role: characterRoleEnum("role").notNull(),
  name: varchar("name", { length: 64 }).notNull(),
  symbolName: varchar("symbol_name", { length: 64 }).notNull(),
  tint: varchar("tint", { length: 32 }).notNull(),
  tagline: varchar("tagline", { length: 255 }),

  age: smallint("age"),
  gender: genderEnum("gender"),
  hairColor: varchar("hair_color", { length: 32 }),
  eyeColor: varchar("eye_color", { length: 32 }),
  hairstyle: varchar("hairstyle", { length: 32 }),

  interests: text("interests").array().notNull().default([]),
  extraInterestNote: text("extra_interest_note").notNull().default(""),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Character = typeof characterSchema.$inferSelect;
export type NewCharacter = typeof characterSchema.$inferInsert;
