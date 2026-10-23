"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Article } from "@/lib/types";
import { CoverImage } from "@/components/public/cover-image";
import { RelativeTime } from "@/components/common/relative-time";
import { SectionHeading } from "@/components/public/section-heading";
import { StarIcon } from "@/components/common/icons";

/**
 * HighlightCarousel — deret kartu geser horizontal (scroll-snap) dengan
 * tombol prev/next di desktop; di mobile cukup digeser jari.
 * Tidak berganti otomatis.
 */
export function HighlightCarousel({ articles }: { articles: Article[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  if (articles.length === 0) return null;

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const btnCls =
    "flex h-8 w-8 items-center justify-center rounded-full border border-line bg-base text-charcoal/70 transition-colors hover:border-brand hover:text-brand";

  return (
    <section aria-labelledby="highlight-berita">
      <div className="flex items-start justify-between gap-4">
        <div id="highlight-berita">
          <SectionHeading title="Highlight Berita" icon={StarIcon} />
        </div>
        <div className="hidden gap-2 sm:flex">
          <button type="button" onClick={() => scroll(-1)} aria-label="Geser ke kiri" className={btnCls}>
            ‹
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Geser ke kanan" className={btnCls}>
            ›
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {articles.map((article) => (
          <article
            key={article.slug}
            className="group w-[82%] shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-base shadow-[0_6px_20px_-12px_rgba(23,25,29,0.25)] sm:w-[260px]"
          >
            <Link href={`/artikel/${article.slug}`} className="block">
              <div className="relative aspect-[16/10] overflow-hidden">
                <CoverImage
                  article={article}
                  sizes="(min-width: 640px) 260px, 82vw"
                  className="transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-charcoal/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                  <StarIcon className="h-3 w-3 text-[#fbbf24]" />
                  {article.category.name}
                </span>
              </div>
              <div className="p-4 sm:p-3">
                <h3 className="line-clamp-3 text-[16px] font-bold leading-snug group-hover:text-brand sm:text-sm">
                  {article.title}
                </h3>
                <p className="mt-2 text-xs text-charcoal/50">
                  <RelativeTime iso={article.publishedAt} /> · {article.author.name}
                </p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
