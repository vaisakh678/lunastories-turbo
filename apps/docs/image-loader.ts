// Custom next/image loader for static export.
//
// next/image only requests widths from imageSizes/deviceSizes in next.config.ts,
// and scripts/optimize-images.mjs pre-generates a WebP for each of those widths,
// so we can map directly to the matching variant without any runtime optimizer.
//
//   <Image src="/types/cat.png" ... />  ->  /_img/types/cat-<width>.webp
//
// `quality` is baked in at build time (see optimize-images.mjs) and ignored here.

interface LoaderArgs {
  src: string;
  width: number;
}

export default function imageLoader({ src, width }: LoaderArgs): string {
  const base = src.replace(/^\//, "").replace(/\.[^.]+$/, "");
  return `/_img/${base}-${width}.webp`;
}
