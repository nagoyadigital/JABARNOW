import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { AdSlot } from "@/components/public/ad-slot";
import { SectionHeading } from "@/components/public/section-heading";
import { ClockIcon } from "@/components/common/icons";
import { TrendingBlock } from "@/components/public/home-trending";
import { HighlightCarousel } from "@/components/public/highlight-carousel";
import { HorizontalNewsRow } from "@/components/public/news-cards";
import { SocialTiles } from "@/components/public/social-links";
import { PortalStats } from "@/components/public/portal-stats";
import {
  listLatestPublished,
  listMostRead,
  getPortalStats,
  cardToArticle,
} from "@/lib/articles";
import { DEMO_CONTENT } from "@/lib/demo";
import { jsonLdString, websiteLd } from "@/lib/seo";
import type { Article } from "@/lib/types";
import {
  heroMain as sHeroMain,
  heroSecondary as sHeroSecondary,
  latestArticles as sLatest,
  mostRead24h as sMostRead24h,
} from "@/lib/sample-content";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: "JabarNow! — RSS" }] },
  },
};

// Data dari DB saat request → route blocking (Cache Components).
export const instant = false;

/** Gabung beberapa daftar tanpa artikel ganda (berdasarkan slug). */
function uniqueBySlug(...lists: Article[][]): Article[] {
  const seen = new Set<string>();
  return lists.flat().filter((a) => !seen.has(a.slug) && seen.add(a.slug));
}

/**
 * Homepage — layout feed ala portal modern (override design lock 2026-10-23):
 * Trending (foto + judul: 1 besar + #2–#5) → Highlight (carousel) → Berita Terbaru (list
 * ringkas, dibatasi + tombol ke /terbaru); kolom kanan: Ikuti Kami,
 * Statistik Portal, iklan.
 * Data NYATA dari database; fallback konten contoh bila DB kosong.
 */
export default async function HomePage() {
  await connection(); // render di request time (DB + Date.now di Most Read)
  const [latestDb, read24, stats] = await Promise.all([
    listLatestPublished(20),
    listMostRead(24, 5),
    getPortalStats(),
  ]);

  const hasData = latestDb.length > 0;

  // Produksi tanpa artikel: tampilkan keadaan kosong, bukan berita contoh
  if (!hasData && !DEMO_CONTENT) {
    return (
      <div className="container-jn py-16 text-center">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(websiteLd()) }}
        />
        <h1 className="text-2xl font-extrabold">Berita segera hadir</h1>
        <p className="mt-2 text-sm text-charcoal/60">
          Redaksi JabarNow! sedang menyiapkan berita terbaru dari 27 kabupaten/kota di Jawa Barat.
        </p>
      </div>
    );
  }
  const latestArticles: Article[] = hasData
    ? latestDb.map(cardToArticle)
    : uniqueBySlug([sHeroMain], sHeroSecondary, sLatest);

  const mostRead24h = read24.length || !DEMO_CONTENT ? read24.map(cardToArticle) : sMostRead24h;

  // Trending: terpopuler 24 jam, dilengkapi artikel terbaru hingga 5
  const trending = uniqueBySlug(mostRead24h, latestArticles).slice(0, 5);
  const trendingSlugs = new Set(trending.map((a) => a.slug));
  // Highlight: artikel terbaru di luar Trending
  const highlight = latestArticles.filter((a) => !trendingSlugs.has(a.slug)).slice(0, 8);
  // Berita Terbaru: 8 terbaru saja (list ringkas); selebihnya di /terbaru
  const feed = latestArticles.slice(0, 8);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(websiteLd()) }}
      />

      <div className="container-jn py-6 md:py-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
          {/* Kolom utama */}
          <div className="min-w-0 space-y-10">
            {/* Iklan leaderboard (desktop) di atas Trending */}
            <div className="hidden md:block">
              <AdSlot
                placement="header-leaderboard"
                label="Header Leaderboard"
                size="728×90"
                height={90}
                preview
              />
            </div>

            <TrendingBlock articles={trending} />

            {/* Iklan mobile pertama: tepat setelah blok pembuka */}
            <div className="md:hidden">
              <AdSlot
                placement="mobile-after-hero"
                label="Mobile Setelah Hero"
                size="320×100"
                height={100}
                preview
              />
            </div>

            <HighlightCarousel articles={highlight} />

            <section aria-labelledby="berita-terbaru">
              <div id="berita-terbaru">
                <SectionHeading title="Berita Terbaru" href="/terbaru" icon={ClockIcon} />
              </div>
              <div className="divide-y divide-line">
                {feed.map((article, i) => (
                  <div key={article.slug}>
                    <HorizontalNewsRow article={article} />
                    {/* Iklan in-feed setelah baris ke-4 */}
                    {i === 3 && (
                      <div className="py-4">
                        <AdSlot
                          placement="in-feed"
                          label="In-Feed"
                          size="728×90"
                          height={90}
                          preview
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Link
                href="/terbaru"
                className="mt-6 block rounded-lg border border-line py-3 text-center text-sm font-semibold text-charcoal/80 transition-colors hover:border-brand hover:text-brand"
              >
                Lihat Berita Lainnya
              </Link>
            </section>
          </div>

          {/* Kolom kanan — urutan: Ikuti Kami → Statistik Portal → iklan; sticky di desktop lebar */}
          <aside className="min-w-0">
            <div className="space-y-6 xl:sticky xl:top-6">
              <SocialTiles />
              {stats && (
                <PortalStats totalViews={stats.totalViews} published30d={stats.published30d} />
              )}
              <AdSlot
                placement="sidebar"
                label="Sidebar (Medium Rectangle)"
                size="300×250"
                height={250}
                preview
              />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
