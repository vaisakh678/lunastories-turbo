import { pgEnum } from "drizzle-orm/pg-core";

export const characterRoleEnum = pgEnum("character_role", ["main", "side"]);

export const characterRelationEnum = pgEnum("character_relation", [
  "parent",
  "grandparent",
  "friend",
  "pet",
  "sibling",
  "teacher",
  "imaginary",
  "other",
]);

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const genderEnum = pgEnum("gender", ["male", "female", "na"]);

export const storyStatusEnum = pgEnum("story_status", [
  "pending",
  "generating",
  "ready",
  "failed",
]);

export const feedbackCategoryEnum = pgEnum("feedback_category", [
  "bug",
  "idea",
  "praise",
  "other",
]);

// Subscription state mirrored from RevenueCat webhooks. "cancelled" and
// "in_grace_period" still grant entitlement until subscription_expires_at;
// see isSubscriptionActive() in the api subscription-service.
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trialing",
  "in_grace_period",
  "cancelled",
  "expired",
  "none",
]);

export const subscriptionStoreEnum = pgEnum("subscription_store", [
  "app_store",
  "play_store",
  "amazon",
  "stripe",
  "promotional",
]);
