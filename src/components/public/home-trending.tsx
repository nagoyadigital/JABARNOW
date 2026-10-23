import Link from "next/link";
import type { Article } from "@/lib/types";
import { CoverImage } from "@/components/public/cover-image";
import { SectionHeading } from "@/components/public/section-heading";
import { FlameIcon } from "@/components/common/icons";

const OVERLAY_GRADIENT =
  "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0) 75%)";

/**
 * TrendingBlock — pembuka beranda: 1 kartu foto besar (#1), lalu #2–#5 sebagai
 * daftar bernomor berthumbnail di HP, dan kartu foto + judul (4 kolom) mulai sm.
 * Menggantikan Hero 1+2 (override design lock 2026-10-23).
 */
export function TrendingBlock({ articles }: { articles: Article[] }) {
  const [top, ...rest] = articles;
  if (!top) return null;

  return (
    <section aria-labelledby="trending-sekarang">
      <div id="trending-sekarang">
        <SectionHeading title="Trending Sekarang" icon={FlameIcon} />
      </div>

      <article className="group">
        <Link
          href={`/artikel/${top.slug}`}
          className="relative block aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] md:aspect-[16/9]"
        >
          <CoverImage
            article={top}
            priority
            variant="overlay"
            sizes="(min-width: 1280px) 760px, 100vw"
            className="transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0" style={{ background: OVERLAY_GRADIENT }} />
          <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
            <span className="inline-block rounded bg-breaking px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
              Trending #1
            </span>
            <h2
              className="mt-2 line-clamp-2 max-w-3xl text-xl font-extrabold leading-tight text-white sm:line-clamp-none md:text-[length:var(--text-hero-desktop)]"
              style={{ textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}
            >
              {top.title}
            </h2>
          </div>
        </Link>
      </article>

      {/* HP: daftar bernomor + thumbnail kanan */}
      {rest.length > 0 && (
        <ol className="mt-2 sm:hidden">
          {rest.slice(0, 4).map((article, i) => (
            <li key={article.slug}>
              <Link href={`/artikel/${article.slug}`} className="group flex items-center gap-4 px-2 py-4">
                <span className="w-6 shrink-0 text-center text-2xl font-extrabold text-charcoal/15">
                  {i + 2}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-[15px] font-bold leading-snug group-hover:text-brand">
                    {article.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-charcoal/50">{article.author.name}</p>
                </div>
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  <CoverImage article={article} sizes="64px" />
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}

      {/* sm ke atas: kartu foto + judul */}
      {rest.length > 0 && (
        <ol className="mt-3 hidden grid-cols-2 gap-3 sm:grid lg:grid-cols-4">
          {rest.slice(0, 4).map((article, i) => (
            <li key={article.slug}>
              <Link
                href={`/artikel/${article.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] lg:aspect-[4/5]"
              >
                <CoverImage
                  article={article}
                  variant="overlay"
                  sizes="(min-width: 1024px) 200px, 50vw"
                  className="transition-transform duration-300 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0" style={{ background: OVERLAY_GRADIENT }} />
                <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-base/90 text-sm font-extrabold text-charcoal">
                  {i + 2}
                </span>
                {/* Padding di pembungkus, bukan di h3: line-clamp + padding membuat baris ke-4 mengintip */}
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <h3
                    className="line-clamp-3 text-sm font-bold leading-snug text-white"
                    style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
                  >
                    {article.title}
                  </h3>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
