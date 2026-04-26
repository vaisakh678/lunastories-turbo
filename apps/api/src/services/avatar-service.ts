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
  patch: {
    name?: string | null;
    isEnabled?: boolean;
    position?: number;
    file?: { buffer: Buffer; contentType: string };
  },
): Promise<AvatarDTO> {
  const [existing] = await db
    .select({ storageKey: characterAvatarSchema.storageKey })
    .from(characterAvatarSchema)
    .where(
      and(
        eq(characterAvatarSchema.id, avatarId),
        isNull(characterAvatarSchema.deletedAt),
      ),
    )
    .limit(1);

  if (!existing) throw NotFound("Avatar not found");

  const {
    file,
    ...metaPatch
  }: typeof patch & { file?: { buffer: Buffer; contentType: string } } = patch;

  const set: Record<string, unknown> = { ...metaPatch };

  if (file) {
    if (!ALLOWED_TYPES.has(file.contentType)) {
      throw BadRequest(`Unsupported file type: ${file.contentType}`);
    }
    if (file.buffer.byteLength > MAX_BYTES) {
      throw BadRequest("File too large (max 4 MB)");
    }

    const ext =
      file.contentType === "image/jpeg"
        ? "jpg"
        : file.contentType === "image/webp"
          ? "webp"
          : "png";
    const newKey = `avatars/${avatarId}.${ext}`;

    await uploadObject(newKey, file.buffer, file.contentType);

    // If the extension changed, the old object is at a different key — clean it up.
    if (existing.storageKey !== newKey) {
      try {
        await deleteObject(existing.storageKey);
      } catch (err) {
        logger.warn(
          { err, key: existing.storageKey },
          "Failed to delete superseded S3 object",
        );
      }
    }

    set.storageKey = newKey;
  }

  if (Object.keys(set).length === 0) {
    return rowToDTO(
      (await db
        .select()
        .from(characterAvatarSchema)
        .where(eq(characterAvatarSchema.id, avatarId))
        .limit(1))[0]!,
    );
  }

  const [updated] = await db
    .update(characterAvatarSchema)
    .set(set)
    .where(eq(characterAvatarSchema.id, avatarId))
    .returning();

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
