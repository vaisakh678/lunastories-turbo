import { pgEnum } from "drizzle-orm/pg-core";

export const characterRoleEnum = pgEnum("character_role", ["main", "side"]);

export const genderEnum = pgEnum("gender", ["male", "female", "na"]);
