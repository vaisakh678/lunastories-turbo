import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "../config/env";

const PRESIGN_TTL_SECONDS = 60 * 60 * 24 * 4; // 4 days

const client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function presignObject(key: string): Promise<string> {
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
    { expiresIn: PRESIGN_TTL_SECONDS },
  );
}

export async function deleteObject(key: string): Promise<void> {
  await client.send(
    new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
  );
}
