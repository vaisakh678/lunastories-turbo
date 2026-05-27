import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import {
  subscriptionStatusEnum,
  subscriptionStoreEnum,
  userRoleEnum,
} from "./enums";

export const userSchema = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 64 }),
  role: userRoleEnum("role").notNull().default("user"),
  emailVerified: boolean("email_verified").notNull().default(false),

  // --- Subscription (synced from RevenueCat webhooks; RevenueCat's
  // app_user_id is set to this row's id, so events map straight back here). ---
  subscriptionStatus: subscriptionStatusEnum("subscription_status")
    .notNull()
    .default("none"),
  subscriptionProductId: varchar("subscription_product_id", { length: 255 }),
  subscriptionStore: subscriptionStoreEnum("subscription_store"),
  // "production" | "sandbox" — lets gating ignore sandbox purchases in prod.
  subscriptionEnvironment: varchar("subscription_environment", { length: 16 }),
  subscriptionExpiresAt: timestamp("subscription_expires_at", {
    withTimezone: true,
  }),
  subscriptionWillRenew: boolean("subscription_will_renew")
    .notNull()
    .default(false),
  // Timestamp of the last RevenueCat event applied — used for idempotency
  // so redelivered/out-of-order webhooks don't clobber newer state.
  subscriptionEventAt: timestamp("subscription_event_at", {
    withTimezone: true,
  }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
