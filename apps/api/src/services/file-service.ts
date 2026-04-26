import db, { fileSchema } from "@repo/db";
import type { FileRefDTO } from "@repo/dto";
import { eq } from "drizzle-orm";

import { NotFound } from "../lib/api-error";
import { logger } from "../lib/logger";
import { deleteObject, presignObject, uploadObject } from "../lib/storage";

export interface UploadFileArgs {
  buffer: Buffer;
  contentType: string;
  /** Path under the bucket. Caller controls naming so we can group by entity (avatars/, stories-audio/, etc.). */
  storageKey: string;
  uploadedBy?: string | null;
}

export async function uploadFile(args: UploadFileArgs) {
  await uploadObject(args.storageKey, args.buffer, args.contentType);

  const [created] = await db
    .insert(fileSchema)
    .values({
      storageKey: args.storageKey,
      contentType: args.contentType,
      uploadedBy: args.uploadedBy ?? null,
    })
    .returning();

  return created;
}

export async function getFile(fileId: string) {
  const [row] = await db
    .select()
    .from(fileSchema)
    .where(eq(fileSchema.id, fileId))
    .limit(1);
  if (!row) throw NotFound("File not found");
  return row;
}

export async function presignFile(fileId: string): Promise<string> {
  const file = await getFile(fileId);
  return presignObject(file.storageKey);
}

export async function fileRefFor(fileId: string): Promise<FileRefDTO> {
  const file = await getFile(fileId);
  return {
    fileId: file.id,
    key: file.storageKey,
    url: await presignObject(file.storageKey),
  };
}

/**
 * Soft-delete the file row and best-effort delete the S3 object. Caller is
 * responsible for ensuring no other rows still reference this file before
 * calling this (we don't ref-count automatically yet).
 */
export async function softDeleteFile(fileId: string): Promise<void> {
  const [row] = await db
    .update(fileSchema)
    .set({ deletedAt: new Date() })
    .where(eq(fileSchema.id, fileId))
    .returning({ id: fileSchema.id, storageKey: fileSchema.storageKey });
  if (!row) return;

  try {
    await deleteObject(row.storageKey);
  } catch (err) {
    logger.warn(
      { err, id: row.id, key: row.storageKey },
      "Failed to delete S3 object for file",
    );
  }
}
