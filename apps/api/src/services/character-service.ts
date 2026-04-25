import db, { characterSchema } from "@repo/db";
import type { CharacterDTO } from "@repo/dto";
import type { CreateCharacter } from "@repo/zod";
import { desc, eq } from "drizzle-orm";

function toDTO(row: typeof characterSchema.$inferSelect): CharacterDTO {
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    symbolName: row.symbolName,
    tint: row.tint,
    tagline: row.tagline,
    age: row.age,
    gender: row.gender,
    hairColor: row.hairColor,
    eyeColor: row.eyeColor,
    hairstyle: row.hairstyle,
    interests: row.interests,
    extraInterestNote: row.extraInterestNote,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createCharacter(
  userId: string,
  data: CreateCharacter,
): Promise<CharacterDTO> {
  const [created] = await db
    .insert(characterSchema)
    .values({
      userId,
      role: data.role,
      name: data.name,
      symbolName: data.symbolName,
      tint: data.tint,
      tagline: data.tagline,
      age: data.age,
      gender: data.gender,
      hairColor: data.hairColor,
      eyeColor: data.eyeColor,
      hairstyle: data.hairstyle,
      interests: data.interests,
      extraInterestNote: data.extraInterestNote,
    })
    .returning();

  return toDTO(created);
}

export async function getCharactersByUser(
  userId: string,
): Promise<CharacterDTO[]> {
  const rows = await db
    .select()
    .from(characterSchema)
    .where(eq(characterSchema.userId, userId))
    .orderBy(desc(characterSchema.createdAt));

  return rows.map(toDTO);
}
