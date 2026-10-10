/**
 * Tipe data domain JabarNow! (dipakai homepage Tahap 2).
 * Di Tahap 3 tipe ini diselaraskan dengan skema Prisma/database.
 */

export type Category = {
  slug: string;
  name: string;
};

export type Region = {
  slug: string;
  name: string;
};

export type Author = {
  slug: string;
  name: string;
};

export type Article = {
  slug: string;
  title: string;
  excerpt?: string;
  // URL gambar cover; null → gunakan fallback placeholder
  image?: string | null;
  // Focal point cover (0-1) untuk object-position
  focalX?: number;
  focalY?: number;
  category: Category;
  region?: Region;
  author: Author;
  // ISO string; waktu editorial WIB
  publishedAt: string;
  // Jumlah views; opsional, hanya jika benar-benar tersedia
  views?: number;
};
