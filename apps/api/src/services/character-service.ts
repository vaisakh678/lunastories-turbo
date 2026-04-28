import db, { characterSchema } from "@repo/db";
import type { CharacterDTO } from "@repo/dto";
import type { CreateCharacter, UpdateCharacter } from "@repo/zod";
import { and, desc, eq, isNull } from "drizzle-orm";

import { NotFound } from "../lib/api-error";

function toDTO(row: typeof characterSchema.$inferSelect): CharacterDTO {
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    symbolName: row.symbolName,
    tint: row.tint,
    tagline: row.tagline,
    relation: row.relation ?? null,
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
      relation: data.relation,
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
    .where(
      and(
        eq(characterSchema.userId, userId),
        isNull(characterSchema.deletedAt),
      ),
    )
    .orderBy(desc(characterSchema.createdAt));

  return rows.map(toDTO);
}

export async function updateCharacter(
  userId: string,
  characterId: string,
  data: UpdateCharacter,
): Promise<CharacterDTO> {
  const [updated] = await db
    .update(characterSchema)
    .set(data)
    .where(
      and(
        eq(characterSchema.id, characterId),
        eq(characterSchema.userId, userId),
        isNull(characterSchema.deletedAt),
      ),
    )
    .returning();

  if (!updated) throw NotFound("Character not found");
  return toDTO(updated);
}

export async function softDeleteCharacter(
  userId: string,
  characterId: string,
): Promise<void> {
  const [deleted] = await db
    .update(characterSchema)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(characterSchema.id, characterId),
        eq(characterSchema.userId, userId),
        isNull(characterSchema.deletedAt),
      ),
    )
    .returning({ id: characterSchema.id });

  if (!deleted) throw NotFound("Character not found");
}
