/**
 * Struktur navigasi publik JabarNow! (placeholder Tahap 1).
 * Kategori & wilayah nanti dinamis dari CMS. Jumlah kelompok footer (4) terkunci.
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

// Footer: empat kelompok terkunci (Tentang Kami, Kategori, Wilayah, Informasi)
export const footerGroups: { title: string; links: NavLink[] }[] = [
  {
    title: "Tentang Kami",
    links: [
      { label: "Tentang JabarNow!", href: "/tentang" },
      { label: "Redaksi", href: "/redaksi" },
      { label: "Kontak", href: "/kontak" },
      { label: "Pedoman Media Siber", href: "/pedoman" },
    ],
  },
  {
    title: "Kategori",
    links: mainCategories.slice(0, 5),
  },
  {
    title: "Wilayah",
    links: [
      { label: "Semua Wilayah", href: "/wilayah" },
      { label: "Kota Bandung", href: "/wilayah/kota-bandung" },
      { label: "Kota Bekasi", href: "/wilayah/kota-bekasi" },
      { label: "Kota Bogor", href: "/wilayah/kota-bogor" },
      { label: "Kota Depok", href: "/wilayah/kota-depok" },
    ],
  },
  {
    title: "Informasi",
    links: [
      { label: "Kebijakan Privasi", href: "/privasi" },
      { label: "Syarat & Ketentuan", href: "/syarat" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Pedoman Siber", href: "/pedoman" },
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
