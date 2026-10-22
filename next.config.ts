import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build mandiri untuk self-host di VPS (folder .next/standalone ringan).
  output: "standalone",
  // Font & logo untuk render slide Studio Sosmed (dibaca via fs saat runtime)
  outputFileTracingIncludes: {
    "/api/sosmed/render/**": ["./src/assets/**/*"],
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      // Gambar media produksi disajikan dari Cloudflare R2 (via env).
      ...(process.env.R2_PUBLIC_URL
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.R2_PUBLIC_URL).hostname,
            },
          ]
        : []),
      // Gambar DEMO/contoh (hapus di produksi bila tidak dipakai).
      { protocol: "https" as const, hostname: "picsum.photos" },
      { protocol: "https" as const, hostname: "fastly.picsum.photos" },
    ],
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
