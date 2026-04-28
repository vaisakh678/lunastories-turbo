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
