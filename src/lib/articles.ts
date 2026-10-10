import { prisma } from "@/lib/prisma";

/**
 * Query artikel publik (hanya PUBLISHED). Fallback aman saat DB belum ada.
 */

export async function getPublishedArticleBySlug(slug: string) {
  try {
    return await prisma.article.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        region: { select: { name: true, slug: true } },
        cover: { select: { url: true, alt: true } },
      },
    });
  } catch {
    return null;
  }
}

export async function getPublishedSlugs(): Promise<
  { slug: string; updatedAt: Date; publishedAt: Date | null }[]
> {
  try {
    return await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 1000,
    });
  } catch {
    return [];
  }
}
