import { prisma } from "@/lib/prisma";

/**
 * Query artikel publik (hanya PUBLISHED). Fallback aman saat DB belum ada.
 */

import type { Article } from "@/lib/types";

/** Petakan ArticleCard (DB) → tipe Article untuk komponen kartu/hero. */
export function cardToArticle(c: ArticleCard): Article {
  return {
    slug: c.slug,
    title: c.title,
    excerpt: c.excerpt ?? undefined,
    image: c.cover?.url ?? null,
    category: c.category
      ? { slug: c.category.slug, name: c.category.name }
      : { slug: "umum", name: "Umum" },
    region: c.region ? { slug: c.region.slug, name: c.region.name } : undefined,
    author: { slug: "author", name: c.author.name },
    tags: c.tags?.map((t) => ({ slug: t.tag.slug, name: t.tag.name })) ?? [],
    publishedAt: (c.publishedAt ?? new Date()).toISOString(),
  };
}

export async function getPublishedArticleBySlug(slug: string) {
  try {
    return await prisma.article.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: {
        author: { select: { name: true, role: true } },
        category: { select: { name: true, slug: true } },
        region: { select: { name: true, slug: true } },
        cover: { select: { url: true, alt: true, caption: true, credit: true } },
        tags: { select: { tag: { select: { name: true, slug: true } } } },
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
  tags: { tag: { name: string; slug: string } }[];
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
  tags: { select: { tag: { select: { name: true, slug: true } } }, take: 3 },
} as const;

/** Ambil N artikel published terbaru (untuk homepage). */
export async function listLatestPublished(take = 12): Promise<ArticleCard[]> {
  try {
    return (await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: cardSelect,
      orderBy: { publishedAt: "desc" },
      take,
    })) as ArticleCard[];
  } catch {
    return [];
  }
}

/** Most Read sederhana (sementara: terbaru per rentang; nanti berbasis views). */
export async function listMostRead(sinceHours: number, take = 5): Promise<ArticleCard[]> {
  const since = new Date(Date.now() - sinceHours * 3600_000);
  try {
    return (await prisma.article.findMany({
      where: { status: "PUBLISHED", publishedAt: { gte: since } },
      select: cardSelect,
      orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
      take,
    })) as ArticleCard[];
  } catch {
    return [];
  }
}

/**
 * Statistik portal untuk widget beranda: total dibaca (jumlah viewCount semua
 * artikel terbit, sepanjang waktu) + jumlah artikel terbit 30 hari terakhir.
 * Belum ada log kunjungan harian, jadi tidak ada angka "pageviews 30 hari".
 */
export async function getPortalStats(): Promise<{ totalViews: number; published30d: number } | null> {
  const since = new Date(Date.now() - 30 * 24 * 3600_000);
  try {
    const [views, published30d] = await Promise.all([
      prisma.article.aggregate({
        where: { status: "PUBLISHED" },
        _sum: { viewCount: true },
      }),
      prisma.article.count({
        where: { status: "PUBLISHED", publishedAt: { gte: since } },
      }),
    ]);
    return { totalViews: views._sum.viewCount ?? 0, published30d };
  } catch {
    return null;
  }
}

/** Tag populer: diurutkan dari yang paling banyak dipakai artikel. */
export async function listPopularTags(
  take = 12,
): Promise<{ slug: string; name: string; count: number }[]> {
  try {
    const tags = await prisma.tag.findMany({
      select: {
        slug: true,
        name: true,
        _count: { select: { articles: true } },
      },
      orderBy: { articles: { _count: "desc" } },
      take,
    });
    return tags
      .filter((t) => t._count.articles > 0)
      .map((t) => ({ slug: t.slug, name: t.name, count: t._count.articles }));
  } catch {
    return [];
  }
}

export async function listPublishedByTag(slug: string): Promise<ArticleCard[]> {
  try {
    return (await prisma.article.findMany({
      where: { status: "PUBLISHED", tags: { some: { tag: { slug } } } },
      select: cardSelect,
      orderBy: { publishedAt: "desc" },
      take: 40,
    })) as ArticleCard[];
  } catch {
    return [];
  }
}

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

export async function getRelatedArticles(
  currentSlug: string,
  categorySlug: string | undefined,
  take = 3,
): Promise<ArticleCard[]> {
  try {
    return (await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        slug: { not: currentSlug },
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      },
      select: cardSelect,
      orderBy: { publishedAt: "desc" },
      take,
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

/** Data taksonomi untuk halaman arsip — null bila slug tidak ada (→ 404). */
export async function getCategoryBySlug(slug: string) {
  try {
    return await prisma.category.findUnique({
      where: { slug },
      select: { name: true, slug: true, description: true },
    });
  } catch {
    return null;
  }
}

export async function getRegionBySlug(slug: string) {
  try {
    return await prisma.region.findUnique({ where: { slug }, select: { name: true, slug: true, type: true } });
  } catch {
    return null;
  }
}

export async function getTagBySlug(slug: string) {
  try {
    return await prisma.tag.findUnique({ where: { slug }, select: { name: true, slug: true } });
  } catch {
    return null;
  }
}

/** Semua slug taksonomi (untuk sitemap). */
export async function listTaxonomySlugs(): Promise<{
  categories: string[];
  regions: string[];
  tags: string[];
}> {
  try {
    const [categories, regions, tags] = await Promise.all([
      prisma.category.findMany({ select: { slug: true } }),
      prisma.region.findMany({ select: { slug: true } }),
      // Hanya tag yang benar-benar dipakai artikel tayang (hindari halaman tipis)
      prisma.tag.findMany({
        where: { articles: { some: { article: { status: "PUBLISHED" } } } },
        select: { slug: true },
        take: 2000,
      }),
    ]);
    return {
      categories: categories.map((c) => c.slug),
      regions: regions.map((r) => r.slug),
      tags: tags.map((t) => t.slug),
    };
  } catch {
    return { categories: [], regions: [], tags: [] };
  }
}

/** Tambah 1 view (dipanggil setelah respons halaman artikel terkirim). */
export async function incrementArticleView(slug: string): Promise<void> {
  try {
    await prisma.article.updateMany({
      where: { slug, status: "PUBLISHED" },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    /* metrik best-effort */
  }
}
