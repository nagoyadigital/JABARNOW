import Link from "next/link";
import type { Article } from "@/lib/types";
import { CoverImage } from "@/components/public/cover-image";
import { RelativeTime } from "@/components/common/relative-time";

function CategoryTag({ name }: { name: string }) {
  return (
    <span className="inline-block rounded bg-brand/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
      {name}
    </span>
  );
}

function Meta({ article }: { article: Article }) {
  return (
    <p className="mt-1 text-xs text-charcoal/50">
      {article.author.name} · <RelativeTime iso={article.publishedAt} />
    </p>
  );
}

/** Kartu berita standar bergambar (grid desktop). */
export function StandardNewsCard({
  article,
  priority = false,
}: {
  article: Article;
  priority?: boolean;
}) {
  return (
    <article className="group overflow-hidden rounded-[var(--radius-card)] border border-line bg-base">
      <Link href={`/artikel/${article.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden">
          <CoverImage
            article={article}
            priority={priority}
            sizes="(min-width: 768px) 33vw, 100vw"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <CategoryTag name={article.category.name} />
          <h3 className="mt-2 text-[var(--text-card-mobile)] font-bold leading-snug md:text-[var(--text-card-desktop)] group-hover:text-brand">
            {article.title}
          </h3>
          <Meta article={article} />
        </div>
      </Link>
    </article>
  );
}

/** Baris berita horizontal (thumbnail kiri, teks kanan) — list desktop & mobile. */
export function HorizontalNewsRow({ article }: { article: Article }) {
  return (
    <article className="group">
      <Link
        href={`/artikel/${article.slug}`}
        className="flex gap-3 py-3"
      >
        <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-md md:w-32">
          <CoverImage
            article={article}
            sizes="128px"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1">
          <CategoryTag name={article.category.name} />
          <h3 className="mt-1 line-clamp-3 text-[var(--text-card-mobile)] font-bold leading-snug group-hover:text-brand">
            {article.title}
          </h3>
          <Meta article={article} />
        </div>
      </Link>
    </article>
  );
}

/** Baris Most Read dengan angka peringkat orange. */
export function MostReadRankRow({
  article,
  rank,
}: {
  article: Article;
  rank: number;
}) {
  return (
    <article className="group border-b border-line last:border-0">
      <Link href={`/artikel/${article.slug}`} className="flex gap-3 py-3">
        <span className="w-7 shrink-0 text-2xl font-extrabold leading-none text-brand">
          {rank}
        </span>
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-brand">
            {article.title}
          </h3>
          <p className="mt-1 text-xs text-charcoal/50">
            <RelativeTime iso={article.publishedAt} />
          </p>
        </div>
      </Link>
    </article>
  );
}
