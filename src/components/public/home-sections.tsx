import Link from "next/link";
import type { Article, Category } from "@/lib/types";
import { CoverImage } from "@/components/public/cover-image";
import { SectionHeading } from "@/components/public/section-heading";

/**
 * JabarHariIni — ringkasan berita dari beberapa wilayah terpilih.
 * BUKAN daftar lengkap 27 kabupaten/kota (00-MASTER-DESIGN-RULES.md).
 */
export function JabarHariIni({ articles }: { articles: Article[] }) {
  return (
    <section aria-labelledby="jabar-hari-ini">
      <div id="jabar-hari-ini">
        <SectionHeading title="Jabar Hari Ini" href="/wilayah" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {articles.map((article) => (
          <article
            key={article.slug}
            className="group overflow-hidden rounded-[var(--radius-card)] border border-line bg-base"
          >
            <Link href={`/artikel/${article.slug}`} className="block">
              <div className="relative aspect-[16/10] overflow-hidden">
                <CoverImage
                  article={article}
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                {article.region && (
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-brand">
                    {article.region.name}
                  </span>
                )}
                <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug group-hover:text-brand">
                  {article.title}
                </h3>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

/**
 * KategoriPilihan — kartu kategori menuju arsip kategori.
 */
export function KategoriPilihan({ categories }: { categories: Category[] }) {
  return (
    <section aria-labelledby="kategori-pilihan">
      <div id="kategori-pilihan">
        <SectionHeading title="Kategori Pilihan" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/kategori/${category.slug}`}
            className="group flex items-center justify-center rounded-[var(--radius-card)] border border-line bg-base p-4 text-center text-sm font-semibold text-charcoal transition-colors hover:border-brand hover:text-brand"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
