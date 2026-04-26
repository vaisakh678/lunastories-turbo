import {
  boolean,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const characterAvatarSchema = pgTable("character_avatars", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 64 }),
  storageKey: text("storage_key").notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  position: smallint("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const avatarEventSchema = pgTable("avatar_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  avatarId: uuid("avatar_id")
    .notNull()
    .references(() => characterAvatarSchema.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 64 }),
  setting: varchar("setting", { length: 32 }),
  action: varchar("action", { length: 32 }),
  tags: text("tags").array().notNull().default([]),
  storageKey: text("storage_key").notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  position: smallint("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type CharacterAvatar = typeof characterAvatarSchema.$inferSelect;
export type NewCharacterAvatar = typeof characterAvatarSchema.$inferInsert;
export type AvatarEvent = typeof avatarEventSchema.$inferSelect;
export type NewAvatarEvent = typeof avatarEventSchema.$inferInsert;
