import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build mandiri untuk self-host di VPS (folder .next/standalone ringan).
  output: "standalone",
  // Font & logo untuk render slide Studio Sosmed (dibaca via fs saat runtime)
  outputFileTracingIncludes: {
    "/api/sosmed/render/**": ["./src/assets/**/*"],
    "/opengraph-image": ["./src/assets/**/*"],
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Header keamanan dasar untuk semua halaman.
  // CSP sengaja belum dipasang: GA4 & script iklan pihak ketiga perlu daftar
  // domain yang disepakati dulu (lihat dokumen audit).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          // HSTS hanya berlaku di HTTPS (browser mengabaikannya di HTTP lokal)
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
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
