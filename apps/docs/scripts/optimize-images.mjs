// Build-time image pipeline for the static export.
//
// Reads raster sources from image-src/** and writes resized WebP variants to
// public/_img/<path>-<width>.webp. The custom next/image loader (image-loader.ts)
// maps each <Image> request to one of these files, so the site stays 100% static
// (output: "export") while still serving correctly sized, modern-format images.
//
// The generated widths are the UNION of next.config's imageSizes + deviceSizes,
// because next/image only ever requests widths from those arrays. Keep the two
// in sync (see WIDTHS below and next.config.ts).

import { readdir, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC_DIR = path.join(ROOT, "image-src");
const OUT_DIR = path.join(ROOT, "public", "_img");

// Must equal [...imageSizes, ...deviceSizes] in next.config.ts.
const WIDTHS = [64, 96, 128, 256, 384, 640, 750, 828, 1080];
const QUALITY = 78;
const RASTER = /\.(png|jpe?g|webp)$/i;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (RASTER.test(entry.name)) yield full;
  }
}

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });

  let count = 0;
  for await (const srcPath of walk(SRC_DIR)) {
    const rel = path.relative(SRC_DIR, srcPath); // e.g. types/cat.png
    const noExt = rel.replace(RASTER, ""); // e.g. types/cat
    const outDir = path.join(OUT_DIR, path.dirname(rel));
    await mkdir(outDir, { recursive: true });

    const base = sharp(srcPath, { animated: false });
    const meta = await base.metadata();

    await Promise.all(
      WIDTHS.map((w) =>
        base
          .clone()
          // never upscale; for widths above the source the file still exists
          // (capped at native) so the loader never 404s.
          .resize({ width: w, withoutEnlargement: true })
          .webp({ quality: QUALITY })
          .toFile(path.join(OUT_DIR, `${noExt}-${w}.webp`)),
      ),
    );
    count++;
    console.log(`  ${rel} (${meta.width}x${meta.height}) -> ${WIDTHS.length} webp`);
  }
  console.log(`optimize-images: ${count} source images -> ${count * WIDTHS.length} variants`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
