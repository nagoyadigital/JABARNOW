import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build mandiri untuk self-host di VPS (folder .next/standalone ringan).
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Gambar media disajikan dari Cloudflare R2 (domain publik via env, Tahap 4+).
    remotePatterns: process.env.R2_PUBLIC_URL
      ? [
          {
            protocol: "https",
            hostname: new URL(process.env.R2_PUBLIC_URL).hostname,
          },
        ]
      : [],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
