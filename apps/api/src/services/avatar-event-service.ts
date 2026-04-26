import db, {
  avatarEventSchema,
  characterAvatarSchema,
  fileSchema,
} from "@repo/db";
import type { AvatarEventDTO } from "@repo/dto";
import { and, asc, eq, isNull } from "drizzle-orm";

import { BadRequest, NotFound } from "../lib/api-error";
import { processAvatarImage } from "../lib/image-processor";
import { logger } from "../lib/logger";
import { presignObject } from "../lib/storage";
import { softDeleteFile, uploadFile } from "./file-service";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

type EventRow = typeof avatarEventSchema.$inferSelect;
type FileRow = typeof fileSchema.$inferSelect;

async function rowToDTO(row: EventRow, file: FileRow): Promise<AvatarEventDTO> {
  const url = await presignObject(file.storageKey);
  return {
    id: row.id,
    avatarId: row.avatarId,
    name: row.name,
    setting: row.setting,
    action: row.action,
    tags: row.tags,
    image: { fileId: file.id, key: file.storageKey, url },
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
    .select({ event: avatarEventSchema, file: fileSchema })
    .from(avatarEventSchema)
    .innerJoin(fileSchema, eq(avatarEventSchema.fileId, fileSchema.id))
    .where(and(...conditions))
    .orderBy(asc(avatarEventSchema.position), asc(avatarEventSchema.createdAt));

  return Promise.all(rows.map((r) => rowToDTO(r.event, r.file)));
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
  const key = `files/${crypto.randomUUID()}.${processed.ext}`;
  const file = await uploadFile({
    buffer: processed.buffer,
    contentType: processed.contentType,
    storageKey: key,
  });

  const [created] = await db
    .insert(avatarEventSchema)
    .values({
      avatarId: args.avatarId,
      name: args.name,
      setting: args.setting,
      action: args.action,
      tags: args.tags,
      fileId: file.id,
    })
    .returning();

  return rowToDTO(created, file);
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
      fileId: avatarEventSchema.fileId,
    });

  if (!row) throw NotFound("Event not found");

  softDeleteFile(row.fileId).catch((err) =>
    logger.warn({ err, id: row.fileId }, "Failed to soft-delete event file"),
  );
}
