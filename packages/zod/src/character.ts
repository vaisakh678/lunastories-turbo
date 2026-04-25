import { z } from "zod";

export const characterRoleSchema = z.enum(["main", "side"]);
export const genderSchema = z.enum(["male", "female", "na"]);

export const createCharacterSchema = z.object({
  role: characterRoleSchema,
  name: z.string().min(1).max(64),
  symbolName: z.string().min(1).max(64),
  tint: z.string().min(1).max(32),
  tagline: z.string().max(255).optional(),

  age: z.number().int().min(1).max(150).optional(),
  gender: genderSchema.optional(),
  hairColor: z.string().max(32).optional(),
  eyeColor: z.string().max(32).optional(),
  hairstyle: z.string().max(32).optional(),

  interests: z.array(z.string().min(1).max(64)).default([]),
  extraInterestNote: z.string().max(1000).default(""),
});

export type CreateCharacter = z.infer<typeof createCharacterSchema>;
