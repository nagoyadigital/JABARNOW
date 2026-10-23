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
  // Akun media sosial resmi. Kosongkan href bila akun belum ada (ikon tampil
  // non-aktif). followers diisi manual (angka) untuk widget "Ikuti Kami";
  // null = tampilkan "Ikuti" tanpa angka.
  social: [
    { platform: "facebook", label: "Facebook", href: "", followers: null },
    { platform: "instagram", label: "Instagram", href: "", followers: null },
    { platform: "youtube", label: "YouTube", href: "", followers: null },
    { platform: "x", label: "X", href: "", followers: null },
    { platform: "tiktok", label: "TikTok", href: "", followers: null },
  ] as { platform: SocialPlatform; label: string; href: string; followers: number | null }[],
} as const;

export type SocialPlatform = "facebook" | "instagram" | "youtube" | "x" | "tiktok";

export type SiteConfig = typeof siteConfig;
