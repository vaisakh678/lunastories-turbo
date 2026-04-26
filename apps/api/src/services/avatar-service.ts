import db, { characterAvatarSchema } from "@repo/db";
import type { AvatarDTO } from "@repo/dto";
import { and, asc, eq, isNull } from "drizzle-orm";

import { BadRequest, NotFound } from "../lib/api-error";
import { logger } from "../lib/logger";
import { deleteObject, presignObject, uploadObject } from "../lib/storage";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

async function rowToDTO(
  row: typeof characterAvatarSchema.$inferSelect,
): Promise<AvatarDTO> {
  const url = await presignObject(row.storageKey);
  return {
    id: row.id,
    name: row.name,
    url,
    isEnabled: row.isEnabled,
    position: row.position,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listAvatars(includeDisabled = false): Promise<AvatarDTO[]> {
  const conditions = [isNull(characterAvatarSchema.deletedAt)];
  if (!includeDisabled) {
    conditions.push(eq(characterAvatarSchema.isEnabled, true));
  }

  const rows = await db
    .select()
    .from(characterAvatarSchema)
    .where(and(...conditions))
    .orderBy(asc(characterAvatarSchema.position), asc(characterAvatarSchema.createdAt));

  return Promise.all(rows.map(rowToDTO));
}

export async function uploadAvatar(args: {
  name: string | null;
  buffer: Buffer;
  contentType: string;
}): Promise<AvatarDTO> {
  if (!ALLOWED_TYPES.has(args.contentType)) {
    throw BadRequest(`Unsupported file type: ${args.contentType}`);
  }
  if (args.buffer.byteLength > MAX_BYTES) {
    throw BadRequest("File too large (max 4 MB)");
  }

  const ext = args.contentType === "image/jpeg"
    ? "jpg"
    : args.contentType === "image/webp"
      ? "webp"
      : "png";

  const [created] = await db
    .insert(characterAvatarSchema)
    .values({
      name: args.name,
      storageKey: "pending",
    })
    .returning();

  const key = `avatars/${created.id}.${ext}`;

  try {
    await uploadObject(key, args.buffer, args.contentType);
  } catch (err) {
    logger.error({ err, id: created.id }, "Avatar upload failed; rolling back row");
    await db
      .delete(characterAvatarSchema)
      .where(eq(characterAvatarSchema.id, created.id));
    throw err;
  }

  const [updated] = await db
    .update(characterAvatarSchema)
    .set({ storageKey: key })
    .where(eq(characterAvatarSchema.id, created.id))
    .returning();

  return rowToDTO(updated);
}

export async function updateAvatar(
  avatarId: string,
  patch: { name?: string | null; isEnabled?: boolean; position?: number },
): Promise<AvatarDTO> {
  const [updated] = await db
    .update(characterAvatarSchema)
    .set(patch)
    .where(
      and(
        eq(characterAvatarSchema.id, avatarId),
        isNull(characterAvatarSchema.deletedAt),
      ),
    )
    .returning();

  if (!updated) throw NotFound("Avatar not found");
  return rowToDTO(updated);
}

export async function softDeleteAvatar(avatarId: string): Promise<void> {
  const [row] = await db
    .update(characterAvatarSchema)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(characterAvatarSchema.id, avatarId),
        isNull(characterAvatarSchema.deletedAt),
      ),
    )
    .returning({ id: characterAvatarSchema.id, storageKey: characterAvatarSchema.storageKey });

  if (!row) throw NotFound("Avatar not found");

  // Best-effort: nuke the S3 object too. Failure isn't fatal.
  try {
    await deleteObject(row.storageKey);
  } catch (err) {
    logger.warn({ err, id: row.id, key: row.storageKey }, "Failed to delete S3 object");
  }
}
