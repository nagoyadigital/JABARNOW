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
