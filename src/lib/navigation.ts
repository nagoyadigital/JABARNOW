/**
 * Struktur navigasi publik JabarNow! (placeholder Tahap 1).
 * Kategori & wilayah nanti dinamis dari CMS.
 * Homepage TIDAK menampilkan direktori 27 kabupaten/kota.
 */

export type NavLink = { label: string; href: string };

// Kategori utama di navbar charcoal (contoh placeholder)
export const mainCategories: NavLink[] = [
  { label: "Berita", href: "/kategori/berita" },
  { label: "Politik", href: "/kategori/politik" },
  { label: "Ekonomi", href: "/kategori/ekonomi" },
  { label: "Olahraga", href: "/kategori/olahraga" },
  { label: "Teknologi", href: "/kategori/teknologi" },
  { label: "Gaya Hidup", href: "/kategori/gaya-hidup" },
];

// Footer & sidebar: tiga kelompok tautan (Tentang, Kerjasama, Legal) —
// override design lock 2026-10-23 (semula 4 kelompok).
export const footerGroups: { title: string; links: NavLink[] }[] = [
  {
    title: "Tentang JabarNow!",
    links: [
      { label: "Tentang Kami", href: "/tentang" },
      { label: "Redaksi", href: "/redaksi" },
      { label: "Kontak", href: "/kontak" },
    ],
  },
  {
    title: "Kerjasama",
    links: [
      { label: "Pasang Iklan", href: "/kontak" },
      { label: "Kirim Rilis Berita", href: "/kontak" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Kebijakan Privasi", href: "/privasi" },
      { label: "Syarat & Ketentuan", href: "/syarat" },
      { label: "Pedoman Media Siber", href: "/pedoman" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
];

// Bottom navigation mobile (selalu terlihat): Beranda, Terbaru, Wilayah, Populer, Menu
export const mobileBottomNav: NavLink[] = [
  { label: "Beranda", href: "/" },
  { label: "Terbaru", href: "/terbaru" },
  { label: "Wilayah", href: "/wilayah" },
  { label: "Populer", href: "/populer" },
  { label: "Menu", href: "#menu" },
];
