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
  heroMain,
  heroSecondary,
  latestArticles,
  mostRead24h,
  mostRead7d,
  jabarHariIni,
  featuredCategories,
  breakingItems,
} from "@/lib/sample-content";

/**
 * Homepage — Tahap 2 (komposisi penuh, data CONTOH).
 * Urutan sesuai 02-HOMEPAGE-DESKTOP.md & 03-HOMEPAGE-MOBILE.md.
 * Data nyata dari database menyusul di Tahap 3.
 */
export default function HomePage() {
  // Berita terbaru: 3 kartu bergambar (grid) + sisanya list horizontal (mixed)
  const gridLatest = latestArticles.slice(0, 3);
  const listLatest = latestArticles.slice(3);

  return (
    <>
      {/* Breaking news (ticker manual) */}
      <BreakingTicker items={breakingItems} />

      <div className="container-jn py-6 md:py-8">
        {/* Hero 1 + 2 statis */}
        <section aria-label="Berita utama" className="mb-8">
          <Hero main={heroMain} secondary={heroSecondary} />
        </section>

        {/* Iklan mobile pertama: tepat setelah seluruh area hero */}
        <div className="mb-8 md:hidden">
          <AdSlot placement="mobile-after-hero" active={false} height={100} />
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
                {latestArticles.map((article) => (
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
                  <AdSlot placement="in-feed" active={false} height={90} />
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
              <AdSlot placement="sidebar" active={false} height={250} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
