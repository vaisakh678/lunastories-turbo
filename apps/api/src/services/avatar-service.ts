import db, { characterAvatarSchema, fileSchema } from "@repo/db";
import type { AvatarDTO } from "@repo/dto";
import { and, asc, eq, isNull } from "drizzle-orm";

import { BadRequest, NotFound } from "../lib/api-error";
import { processAvatarImage } from "../lib/image-processor";
import { logger } from "../lib/logger";
import { presignObject } from "../lib/storage";
import { softDeleteFile, uploadFile } from "./file-service";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

type AvatarRow = typeof characterAvatarSchema.$inferSelect;
type FileRow = typeof fileSchema.$inferSelect;

async function rowToDTO(row: AvatarRow, file: FileRow): Promise<AvatarDTO> {
  const url = await presignObject(file.storageKey);
  return {
    id: row.id,
    name: row.name,
    image: { fileId: file.id, key: file.storageKey, url },
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
    .select({
      avatar: characterAvatarSchema,
      file: fileSchema,
    })
    .from(characterAvatarSchema)
    .innerJoin(fileSchema, eq(characterAvatarSchema.fileId, fileSchema.id))
    .where(and(...conditions))
    .orderBy(asc(characterAvatarSchema.position), asc(characterAvatarSchema.createdAt));

  return Promise.all(rows.map((r) => rowToDTO(r.avatar, r.file)));
}

async function loadAvatarOr404(avatarId: string) {
  const [row] = await db
    .select({ avatar: characterAvatarSchema, file: fileSchema })
    .from(characterAvatarSchema)
    .innerJoin(fileSchema, eq(characterAvatarSchema.fileId, fileSchema.id))
    .where(
      and(
        eq(characterAvatarSchema.id, avatarId),
        isNull(characterAvatarSchema.deletedAt),
      ),
    )
    .limit(1);
  if (!row) throw NotFound("Avatar not found");
  return row;
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

  const processed = await processAvatarImage(args.buffer);

  // Upload first so we can fail before we have any rows to clean up.
  // Storage key uses a random uuid baked into the path; collision is statistically zero.
  const tempKey = `files/${crypto.randomUUID()}.${processed.ext}`;
  const file = await uploadFile({
    buffer: processed.buffer,
    contentType: processed.contentType,
    storageKey: tempKey,
  });

  const [created] = await db
    .insert(characterAvatarSchema)
    .values({ name: args.name, fileId: file.id })
    .returning();

  return rowToDTO(created, file);
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
  const existing = await loadAvatarOr404(avatarId);

  const set: Record<string, unknown> = {};
  if (patch.name !== undefined) set.name = patch.name;
  if (patch.isEnabled !== undefined) set.isEnabled = patch.isEnabled;
  if (patch.position !== undefined) set.position = patch.position;

  let nextFile: FileRow = existing.file;

  if (patch.file) {
    if (!ALLOWED_TYPES.has(patch.file.contentType)) {
      throw BadRequest(`Unsupported file type: ${patch.file.contentType}`);
    }
    if (patch.file.buffer.byteLength > MAX_BYTES) {
      throw BadRequest("File too large (max 4 MB)");
    }

    const processed = await processAvatarImage(patch.file.buffer);
    const newKey = `files/${crypto.randomUUID()}.${processed.ext}`;
    const created = await uploadFile({
      buffer: processed.buffer,
      contentType: processed.contentType,
      storageKey: newKey,
    });

    set.fileId = created.id;
    nextFile = created;

    // Garbage-collect the previous file (best-effort, no other refs at this point).
    softDeleteFile(existing.file.id).catch((err) =>
      logger.warn({ err, id: existing.file.id }, "Failed to soft-delete prior file"),
    );
  }

  if (Object.keys(set).length === 0) {
    return rowToDTO(existing.avatar, nextFile);
  }

  const [updated] = await db
    .update(characterAvatarSchema)
    .set(set)
    .where(eq(characterAvatarSchema.id, avatarId))
    .returning();

  return rowToDTO(updated, nextFile);
}

export async function softDeleteAvatar(avatarId: string): Promise<void> {
  const existing = await loadAvatarOr404(avatarId);

  await db
    .update(characterAvatarSchema)
    .set({ deletedAt: new Date() })
    .where(eq(characterAvatarSchema.id, avatarId));

  // Garbage-collect the file row + S3 object too, since the avatar is the sole reference.
  softDeleteFile(existing.file.id).catch((err) =>
    logger.warn({ err, id: existing.file.id }, "Failed to soft-delete avatar file"),
  );
}
