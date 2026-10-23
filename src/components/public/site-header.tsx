import { BrandLogo } from "@/components/brand/brand-logo";
import { MobileMenu } from "@/components/public/mobile-menu";
import { SearchOverlay } from "@/components/public/search-overlay";
import { getRegionNav } from "@/lib/cms-data";

/**
 * SiteHeader — header mobile & tablet (< lg): hamburger kiri, logo tengah,
 * search kanan; kategori/wilayah di drawer. Di desktop (≥ lg) navigasi
 * pindah ke SiteSidebar kiri (override design lock 2026-10-23).
 */
export async function SiteHeader() {
  const regions = await getRegionNav();

  return (
    // Catatan: JANGAN beri backdrop-filter/transform di header ini — itu membuat
    // drawer & overlay cari (position: fixed) terkurung setinggi header.
    <header className="sticky top-0 z-40 bg-base shadow-[0_8px_24px_-16px_rgba(23,25,29,0.35)] lg:hidden">
      <div className="container-jn flex h-16 items-center justify-between">
        <MobileMenu regions={regions} />
        <BrandLogo height={44} priority />
        <SearchOverlay variant="light" />
      </div>
    </header>
  );
}
