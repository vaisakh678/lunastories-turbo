import sharp from "sharp";

const AVATAR_SIZE = 512;

export interface ProcessedImage {
  buffer: Buffer;
  contentType: "image/webp";
  ext: "webp";
}

/**
 * Resize the input image to a fixed 512×512 square, center-crop if needed,
 * and re-encode as lossless WebP. Returns the processed buffer + the
 * content-type / extension to store on S3.
 */
export async function processAvatarImage(input: Buffer): Promise<ProcessedImage> {
  const buffer = await sharp(input)
    .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover", position: "center" })
    .webp({ lossless: true })
    .toBuffer();

  return { buffer, contentType: "image/webp", ext: "webp" };
}
