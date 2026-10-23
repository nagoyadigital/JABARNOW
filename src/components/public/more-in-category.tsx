import Link from "next/link";
import type { Article } from "@/lib/types";
import { CoverImage } from "@/components/public/cover-image";
import { RelativeTime } from "@/components/common/relative-time";

/**
 * MoreInCategory — "Lainnya di <Kategori>" untuk kolom kanan artikel:
 * thumbnail kiri, judul 2 baris, penulis & waktu di bawah.
 */
export function MoreInCategory({
  categoryName,
  categorySlug,
  articles,
}: {
  categoryName: string;
  categorySlug: string;
  articles: Article[];
}) {
  if (articles.length === 0) return null;
  return (
    <section aria-labelledby="lainnya-kategori">
      <h2
        id="lainnya-kategori"
        className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em]"
      >
        <span aria-hidden="true" className="h-3 w-3 rounded-[3px] bg-breaking" />
        <Link href={`/kategori/${categorySlug}`} className="hover:text-brand">
          Lainnya di {categoryName}
        </Link>
      </h2>
      <ul className="divide-y divide-line">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link href={`/artikel/${article.slug}`} className="group flex gap-4 py-4 first:pt-0">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                <CoverImage
                  article={article}
                  sizes="96px"
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <h3 className="line-clamp-2 text-sm font-bold leading-snug group-hover:text-brand">
                  {article.title}
                </h3>
                <p className="flex items-center justify-between gap-2 text-xs text-charcoal/50">
                  <span className="truncate">{article.author.name}</span>
                  <span className="shrink-0">
                    <RelativeTime iso={article.publishedAt} />
                  </span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
