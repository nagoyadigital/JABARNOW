import Link from "next/link";
import type { Article } from "@/lib/types";
import { CoverImage } from "@/components/public/cover-image";
import { RelativeTime } from "@/components/common/relative-time";

/**
 * Hero — 1 kartu foto besar overlay + 2 pendamping bertumpuk.
 * Statis: tanpa slider, dot, atau panah (00-MASTER-DESIGN-RULES.md).
 */
export function Hero({
  main,
  secondary,
}: {
  main: Article;
  secondary: Article[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Hero utama overlay */}
      <article className="group col-span-1 lg:col-span-2">
        <Link
          href={`/artikel/${main.slug}`}
          className="relative block aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] md:aspect-[16/9]"
        >
          <CoverImage
            article={main}
            priority
            variant="overlay"
            sizes="(min-width: 1024px) 66vw, 100vw"
          />
          {/* Gradient gelap untuk keterbacaan judul */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0) 70%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
            <span className="inline-block rounded bg-brand px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
              {main.category.name}
            </span>
            <h2
              className="mt-2 max-w-3xl text-xl font-extrabold leading-tight text-white md:text-[var(--text-hero-desktop)]"
              style={{ textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}
            >
              {main.title}
            </h2>
            <p
              className="mt-2 text-xs text-white/90"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
            >
              {main.author.name} · <RelativeTime iso={main.publishedAt} />
            </p>
          </div>
        </Link>
      </article>

      {/* 2 pendamping bertumpuk */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {secondary.slice(0, 2).map((article) => (
          <article key={article.slug} className="group">
            <Link
              href={`/artikel/${article.slug}`}
              className="relative block aspect-[16/9] overflow-hidden rounded-[var(--radius-card)] lg:aspect-[16/10]"
            >
              <CoverImage
                article={article}
                variant="overlay"
                sizes="(min-width: 1024px) 33vw, 50vw"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 75%)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <span className="inline-block rounded bg-brand px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {article.category.name}
                </span>
                <h3
                  className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-white md:text-base"
                  style={{ textShadow: "0 1px 10px rgba(0,0,0,0.6)" }}
                >
                  {article.title}
                </h3>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
