import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const userSchema = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 64 }),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});
