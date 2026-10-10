/**
 * Konfigurasi situs global JabarNow!
 * Nilai dinamis (nama, tagline, logo) nanti dikelola via CMS Website Settings.
 * Ini default/fallback aman untuk pengembangan.
 */

export const siteConfig = {
  name: "JabarNow!",
  tagline: "Portal Berita Jawa Barat",
  description:
    "JabarNow! — portal berita Jawa Barat: berita terbaru, terpopuler, dan informasi dari 27 kabupaten/kota.",
  // Domain final (lihat docs/jabarnow): https://jabarnow.id
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://jabarnow.id",
  locale: "id-ID",
  timezone: "Asia/Jakarta",
  developer: {
    name: "Nagoya Digital",
    url: "https://nagoyadigital.com",
  },
  // Logo resmi diunggah manual via CMS oleh Super Admin.
  // Placeholder aman yang tidak mengubah layout.
  logo: {
    src: "/brand/logo.png",
    alt: "JabarNow!",
  },
  copyrightYear: 2026,
} as const;

export type SiteConfig = typeof siteConfig;
