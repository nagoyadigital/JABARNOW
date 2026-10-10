import { prisma } from "@/lib/prisma";

/**
 * Helper data CMS dengan fallback aman saat DB belum tersambung.
 */

export async function getCategoryOptions(): Promise<{ id: string; name: string }[]> {
  try {
    return await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getRegionOptions(): Promise<{ id: string; name: string }[]> {
  try {
    return await prisma.region.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

/**
 * Daftar wilayah untuk dropdown navbar (slug, nama, tipe).
 * `"use cache"`: hasil di-cache agar header tidak memaksa halaman jadi dinamis
 * (wilayah jarang berubah). Fallback kosong bila DB belum tersambung.
 */
export async function getRegionNav(): Promise<
  { slug: string; name: string; type: string }[]
> {
  "use cache";
  try {
    return await prisma.region.findMany({
      select: { slug: true, name: true, type: true },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
  } catch {
    return [];
  }
}
