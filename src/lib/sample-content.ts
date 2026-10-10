/**
 * CONTOH KONTEN — placeholder visual Tahap 2 saja.
 * BUKAN berita nyata, bukan statistik aktual. Semua gambar null (pakai fallback).
 * Di Tahap 3 diganti data nyata dari database. Jangan dianggap data produksi.
 */
import type { Article, Category } from "@/lib/types";

const cat = (slug: string, name: string): Category => ({ slug, name });

const categories = {
  berita: cat("berita", "Berita"),
  politik: cat("politik", "Politik"),
  ekonomi: cat("ekonomi", "Ekonomi"),
  olahraga: cat("olahraga", "Olahraga"),
  teknologi: cat("teknologi", "Teknologi"),
  gayaHidup: cat("gaya-hidup", "Gaya Hidup"),
};

function make(
  i: number,
  title: string,
  category: Category,
  regionName?: string,
): Article {
  return {
    slug: `contoh-artikel-${i}`,
    title,
    excerpt:
      "Ringkasan contoh untuk pratinjau tata letak. Teks ini placeholder dan akan diganti konten redaksi nyata pada tahap berikutnya.",
    image: null,
    focalX: 0.5,
    focalY: 0.5,
    category,
    region: regionName
      ? { slug: regionName.toLowerCase().replace(/\s+/g, "-"), name: regionName }
      : undefined,
    author: { slug: "redaksi", name: "Redaksi" },
    publishedAt: new Date(Date.now() - i * 3600_000).toISOString(),
    views: undefined,
  };
}

// Hero: 1 utama + 2 pendamping
export const heroMain = make(
  1,
  "Judul Berita Utama Contoh untuk Pratinjau Komposisi Hero Overlay",
  categories.berita,
  "Kota Bandung",
);

export const heroSecondary: Article[] = [
  make(2, "Berita Pendamping Pertama di Area Hero", categories.politik, "Kota Bekasi"),
  make(3, "Berita Pendamping Kedua di Area Hero", categories.ekonomi, "Kabupaten Bogor"),
];

// Berita terbaru (mixed grid + list)
export const latestArticles: Article[] = Array.from({ length: 7 }, (_, idx) => {
  const i = idx + 4;
  const pool = [
    categories.olahraga,
    categories.teknologi,
    categories.gayaHidup,
    categories.ekonomi,
    categories.politik,
    categories.berita,
    categories.teknologi,
  ];
  return make(i, `Contoh Judul Berita Terbaru Nomor ${idx + 1}`, pool[idx]);
});

// Most Read — dibedakan per rentang (24 Jam / 7 Hari)
export const mostRead24h: Article[] = Array.from({ length: 5 }, (_, idx) =>
  make(20 + idx, `Terpopuler 24 Jam — Judul Contoh ${idx + 1}`, categories.berita),
);

export const mostRead7d: Article[] = Array.from({ length: 5 }, (_, idx) =>
  make(30 + idx, `Terpopuler 7 Hari — Judul Contoh ${idx + 1}`, categories.politik),
);

// Jabar Hari Ini — pilihan beberapa wilayah (BUKAN daftar 27 kab/kota)
export const jabarHariIni: Article[] = [
  make(40, "Kabar dari Kota Bandung Hari Ini", categories.berita, "Kota Bandung"),
  make(41, "Perkembangan Terbaru di Kota Bekasi", categories.ekonomi, "Kota Bekasi"),
  make(42, "Sorotan Kabupaten Bogor", categories.politik, "Kabupaten Bogor"),
  make(43, "Agenda Kota Depok", categories.gayaHidup, "Kota Depok"),
];

// Kategori Pilihan (kartu kategori → arsip)
export const featuredCategories: Category[] = [
  categories.politik,
  categories.ekonomi,
  categories.olahraga,
  categories.teknologi,
  categories.gayaHidup,
  categories.berita,
];

// Breaking news (ticker manual)
export const breakingItems = [
  { label: "Contoh breaking news pertama untuk pratinjau ticker manual", href: "#" },
  { label: "Contoh breaking news kedua", href: "#" },
  { label: "Contoh breaking news ketiga", href: "#" },
];
