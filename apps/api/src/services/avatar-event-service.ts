import db, { avatarEventSchema, characterAvatarSchema } from "@repo/db";
import type { AvatarEventDTO } from "@repo/dto";
import { and, asc, eq, isNull } from "drizzle-orm";

import { BadRequest, NotFound } from "../lib/api-error";
import { processAvatarImage } from "../lib/image-processor";
import { logger } from "../lib/logger";
import { deleteObject, presignObject, uploadObject } from "../lib/storage";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

async function rowToDTO(
  row: typeof avatarEventSchema.$inferSelect,
): Promise<AvatarEventDTO> {
  const url = await presignObject(row.storageKey);
  return {
    id: row.id,
    avatarId: row.avatarId,
    name: row.name,
    setting: row.setting,
    action: row.action,
    tags: row.tags,
    url,
    isEnabled: row.isEnabled,
    position: row.position,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function ensureAvatarExists(avatarId: string): Promise<void> {
  const [row] = await db
    .select({ id: characterAvatarSchema.id })
    .from(characterAvatarSchema)
    .where(
      and(
        eq(characterAvatarSchema.id, avatarId),
        isNull(characterAvatarSchema.deletedAt),
      ),
    )
    .limit(1);

  if (!row) throw NotFound("Avatar not found");
}

export async function listEventsForAvatar(
  avatarId: string,
  includeDisabled = false,
): Promise<AvatarEventDTO[]> {
  await ensureAvatarExists(avatarId);

  const conditions = [
    eq(avatarEventSchema.avatarId, avatarId),
    isNull(avatarEventSchema.deletedAt),
  ];
  if (!includeDisabled) {
    conditions.push(eq(avatarEventSchema.isEnabled, true));
  }

  const rows = await db
    .select()
    .from(avatarEventSchema)
    .where(and(...conditions))
    .orderBy(asc(avatarEventSchema.position), asc(avatarEventSchema.createdAt));

  return Promise.all(rows.map(rowToDTO));
}

export async function uploadAvatarEvent(args: {
  avatarId: string;
  name: string | null;
  setting: string | null;
  action: string | null;
  tags: string[];
  buffer: Buffer;
  contentType: string;
}): Promise<AvatarEventDTO> {
  await ensureAvatarExists(args.avatarId);

  if (!ALLOWED_TYPES.has(args.contentType)) {
    throw BadRequest(`Unsupported file type: ${args.contentType}`);
  }
  if (args.buffer.byteLength > MAX_BYTES) {
    throw BadRequest("File too large (max 4 MB)");
  }

  const processed = await processAvatarImage(args.buffer);

  const [created] = await db
    .insert(avatarEventSchema)
    .values({
      avatarId: args.avatarId,
      name: args.name,
      setting: args.setting,
      action: args.action,
      tags: args.tags,
      storageKey: "pending",
    })
    .returning();

  const key = `avatars/${args.avatarId}/events/${created.id}.${processed.ext}`;

  try {
    await uploadObject(key, processed.buffer, processed.contentType);
  } catch (err) {
    logger.error({ err, id: created.id }, "Event upload failed; rolling back row");
    await db.delete(avatarEventSchema).where(eq(avatarEventSchema.id, created.id));
    throw err;
  }

  const [updated] = await db
    .update(avatarEventSchema)
    .set({ storageKey: key })
    .where(eq(avatarEventSchema.id, created.id))
    .returning();

  return rowToDTO(updated);
}

export async function softDeleteAvatarEvent(
  avatarId: string,
  eventId: string,
): Promise<void> {
  const [row] = await db
    .update(avatarEventSchema)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(avatarEventSchema.id, eventId),
        eq(avatarEventSchema.avatarId, avatarId),
        isNull(avatarEventSchema.deletedAt),
      ),
    )
    .returning({
      id: avatarEventSchema.id,
      storageKey: avatarEventSchema.storageKey,
    });

  if (!row) throw NotFound("Event not found");

  try {
    await deleteObject(row.storageKey);
  } catch (err) {
    logger.warn(
      { err, id: row.id, key: row.storageKey },
      "Failed to delete S3 object",
    );
  }
}
