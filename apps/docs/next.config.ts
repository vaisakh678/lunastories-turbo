import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    // Static export has no runtime optimizer. We pre-generate WebP variants at
    // build time (scripts/optimize-images.mjs) and resolve them via this loader.
    loader: "custom",
    loaderFile: "./image-loader.ts",
    // next/image only requests widths from these arrays; the optimize script
    // generates exactly one WebP per width. Keep WIDTHS in optimize-images.mjs
    // equal to [...imageSizes, ...deviceSizes].
    imageSizes: [64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080],
  },
};

export default nextConfig;
