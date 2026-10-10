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

export type ArticleCard = {
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: Date | null;
  category: { name: string; slug: string } | null;
  region: { name: string; slug: string } | null;
  author: { name: string };
  cover: { url: string; alt: string | null } | null;
};

const cardSelect = {
  slug: true,
  title: true,
  excerpt: true,
  publishedAt: true,
  category: { select: { name: true, slug: true } },
  region: { select: { name: true, slug: true } },
  author: { select: { name: true } },
  cover: { select: { url: true, alt: true } },
} as const;

export async function listPublishedByCategory(slug: string): Promise<ArticleCard[]> {
  try {
    return (await prisma.article.findMany({
      where: { status: "PUBLISHED", category: { slug } },
      select: cardSelect,
      orderBy: { publishedAt: "desc" },
      take: 40,
    })) as ArticleCard[];
  } catch {
    return [];
  }
}

export async function listPublishedByRegion(slug: string): Promise<ArticleCard[]> {
  try {
    return (await prisma.article.findMany({
      where: { status: "PUBLISHED", region: { slug } },
      select: cardSelect,
      orderBy: { publishedAt: "desc" },
      take: 40,
    })) as ArticleCard[];
  } catch {
    return [];
  }
}

export async function searchPublished(q: string): Promise<ArticleCard[]> {
  if (!q.trim()) return [];
  try {
    return (await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
        ],
      },
      select: cardSelect,
      orderBy: { publishedAt: "desc" },
      take: 40,
    })) as ArticleCard[];
  } catch {
    return [];
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
