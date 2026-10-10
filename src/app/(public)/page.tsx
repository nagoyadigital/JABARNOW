import { connection } from "next/server";
import { Hero } from "@/components/public/hero";
import { BreakingTicker } from "@/components/public/breaking-ticker";
import { MostRead } from "@/components/public/most-read";
import { AdSlot } from "@/components/public/ad-slot";
import { SectionHeading } from "@/components/public/section-heading";
import {
  StandardNewsCard,
  HorizontalNewsRow,
} from "@/components/public/news-cards";
import { JabarHariIni, KategoriPilihan } from "@/components/public/home-sections";
import {
  listLatestPublished,
  listMostRead,
  cardToArticle,
} from "@/lib/articles";
import type { Article } from "@/lib/types";
import {
  heroMain as sHeroMain,
  heroSecondary as sHeroSecondary,
  latestArticles as sLatest,
  mostRead24h as sMostRead24h,
  mostRead7d as sMostRead7d,
  jabarHariIni as sJabarHariIni,
  featuredCategories,
  breakingItems as sBreaking,
} from "@/lib/sample-content";

// Data dari DB saat request → route blocking (Cache Components).
export const instant = false;

/**
 * Homepage — komposisi penuh, data NYATA dari database.
 * Fallback ke konten contoh bila DB kosong (belum ada artikel published).
 * Urutan sesuai 02-HOMEPAGE-DESKTOP.md & 03-HOMEPAGE-MOBILE.md.
 */
export default async function HomePage() {
  await connection(); // render di request time (DB + Date.now di Most Read)
  const [latestDb, read24, read7] = await Promise.all([
    listLatestPublished(12),
    listMostRead(24, 5),
    listMostRead(24 * 7, 5),
  ]);

  const hasData = latestDb.length > 0;
  const latestArticles: Article[] = hasData
    ? latestDb.map(cardToArticle)
    : sLatest;

  // Hero: artikel terbaru pertama + 2 berikutnya (atau fallback)
  const heroMain = hasData ? latestArticles[0] : sHeroMain;
  const heroSecondary = hasData ? latestArticles.slice(1, 3) : sHeroSecondary;
  // Sisanya untuk Berita Terbaru
  const feed = hasData ? latestArticles.slice(3) : latestArticles;

  const mostRead24h = read24.length ? read24.map(cardToArticle) : sMostRead24h;
  const mostRead7d = read7.length ? read7.map(cardToArticle) : sMostRead7d;

  // Jabar Hari Ini: artikel ber-wilayah (atau fallback)
  const regionArticles = latestArticles.filter((a) => a.region).slice(0, 4);
  const jabarHariIni = regionArticles.length >= 2 ? regionArticles : sJabarHariIni;

  const breakingItems = hasData
    ? latestArticles.slice(0, 3).map((a) => ({ label: a.title, href: `/artikel/${a.slug}` }))
    : sBreaking;

  // Berita terbaru: 3 kartu bergambar (grid) + sisanya list horizontal (mixed)
  const gridLatest = feed.slice(0, 3);
  const listLatest = feed.slice(3);

  return (
    <>
      {/* Breaking news (ticker manual) */}
      <BreakingTicker items={breakingItems} />

      <div className="container-jn py-6 md:py-8">
        {/* Iklan leaderboard (desktop) — contoh posisi di atas hero */}
        <div className="mb-6 hidden md:block">
          <AdSlot
            placement="header-leaderboard"
            label="Header Leaderboard"
            size="728×90"
            height={90}
            preview
          />
        </div>

        {/* Hero 1 + 2 statis */}
        <section aria-label="Berita utama" className="mb-8">
          <Hero main={heroMain} secondary={heroSecondary} />
        </section>

        {/* Iklan mobile pertama: tepat setelah seluruh area hero */}
        <div className="mb-8 md:hidden">
          <AdSlot
            placement="mobile-after-hero"
            label="Mobile Setelah Hero"
            size="320×100"
            height={100}
            preview
          />
        </div>

        {/* Konten + sidebar (desktop 8:4) */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Konten utama */}
          <div className="lg:col-span-8">
            <section aria-labelledby="berita-terbaru">
              <div id="berita-terbaru">
                <SectionHeading title="Berita Terbaru" href="/terbaru" />
              </div>

              {/* Mobile: seluruh daftar sebagai list horizontal (03-HOMEPAGE-MOBILE.md) */}
              <div className="divide-y divide-line sm:hidden">
                {feed.map((article) => (
                  <HorizontalNewsRow key={article.slug} article={article} />
                ))}
              </div>

              {/* Desktop/tablet: mixed grid kartu bergambar + list horizontal */}
              <div className="hidden sm:block">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {gridLatest.map((article, i) => (
                    <StandardNewsCard
                      key={article.slug}
                      article={article}
                      priority={i === 0}
                    />
                  ))}
                </div>

                {/* Iklan in-feed horizontal di antara blok konten */}
                <div className="my-6">
                  <AdSlot
                    placement="in-feed"
                    label="In-Feed"
                    size="728×90"
                    height={90}
                    preview
                  />
                </div>

                {/* List horizontal (mixed layout) */}
                <div className="divide-y divide-line">
                  {listLatest.map((article) => (
                    <HorizontalNewsRow key={article.slug} article={article} />
                  ))}
                </div>
              </div>
            </section>

            {/* Jabar Hari Ini */}
            <div className="mt-10">
              <JabarHariIni articles={jabarHariIni} />
            </div>

            {/* Kategori Pilihan */}
            <div className="mt-10">
              <KategoriPilihan categories={featuredCategories} />
            </div>
          </div>

          {/* Sidebar — Most Read + iklan sidebar; sticky di desktop */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-4 space-y-6">
              <MostRead data24h={mostRead24h} data7d={mostRead7d} />
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
