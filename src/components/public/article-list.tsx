import type { ArticleCard } from "@/lib/articles";
import type { Article } from "@/lib/types";
import { HorizontalNewsRow, StandardNewsCard } from "@/components/public/news-cards";

/** Petakan ArticleCard (DB) → tipe Article yang dipakai komponen kartu. */
function toArticle(c: ArticleCard): Article {
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
    publishedAt: (c.publishedAt ?? new Date()).toISOString(),
  };
}

/**
 * ArticleArchiveList — grid kartu untuk halaman arsip (kategori/wilayah/search).
 * Empty state bila kosong.
 */
export function ArticleArchiveList({
  items,
  emptyText = "Belum ada artikel.",
}: {
  items: ArticleCard[];
  emptyText?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-muted p-8 text-center text-sm text-charcoal/60">
        {emptyText}
      </div>
    );
  }

  const articles = items.map(toArticle);
  return (
    <>
      {/* Mobile: list horizontal */}
      <div className="divide-y divide-line sm:hidden">
        {articles.map((a) => (
          <HorizontalNewsRow key={a.slug} article={a} />
        ))}
      </div>
      {/* Desktop: grid */}
      <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <StandardNewsCard key={a.slug} article={a} />
        ))}
      </div>
    </>
  );
}
