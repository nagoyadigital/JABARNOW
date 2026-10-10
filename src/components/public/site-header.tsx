import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { WibDate } from "@/components/common/wib-date";
import { MobileMenu } from "@/components/public/mobile-menu";
import { SearchIcon } from "@/components/common/icons";
import { mainCategories } from "@/lib/navigation";

/**
 * SiteHeader — shell publik.
 * Desktop (02-HOMEPAGE-DESKTOP.md): topbar → header putih → navbar charcoal.
 * Mobile (03-HOMEPAGE-MOBILE.md): header putih (hamburger kiri, logo tengah,
 * search kanan); kategori pindah ke drawer, bukan navbar charcoal.
 */
export function SiteHeader() {
  return (
    <header>
      {/* ===== Mobile header (hamburger · logo · search) ===== */}
      <div className="border-b border-line bg-base md:hidden">
        <div className="container-jn flex h-[var(--h-header-mobile)] items-center justify-between">
          <MobileMenu />
          <BrandLogo height={32} priority />
          <Link
            href="/cari"
            aria-label="Pencarian"
            className="flex h-10 w-10 items-center justify-center rounded-md text-charcoal transition-colors hover:text-brand"
          >
            <SearchIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* ===== Desktop header ===== */}
      <div className="hidden md:block">
        {/* 1) Topbar */}
        <div className="border-b border-line bg-muted text-charcoal/80">
          <div className="container-jn flex h-[var(--h-topbar)] items-center justify-between text-xs">
            <WibDate />
            <nav aria-label="Tautan informasi">
              <ul className="flex items-center gap-4">
                <li>
                  <Link href="/tentang" className="hover:text-brand">
                    Tentang
                  </Link>
                </li>
                <li>
                  <Link href="/redaksi" className="hover:text-brand">
                    Redaksi
                  </Link>
                </li>
                <li>
                  <Link href="/kontak" className="hover:text-brand">
                    Kontak
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* 2) Header putih */}
        <div className="border-b border-line bg-base">
          <div className="container-jn flex min-h-[var(--h-header-desktop)] items-center justify-between py-3">
            <BrandLogo height={48} priority />
            <div
              className="text-[11px] text-charcoal/30"
              aria-hidden="true"
            >
              {/* AdSlot: header-leaderboard (nonaktif) */}
            </div>
          </div>
        </div>

        {/* 3) Navbar charcoal */}
        <div className="bg-charcoal text-white">
          <div className="container-jn flex h-[var(--h-nav-desktop)] items-center justify-between">
            <nav aria-label="Kategori utama">
              <ul className="flex items-center gap-5 text-sm font-medium">
                {mainCategories.map((cat) => (
                  <li key={cat.href}>
                    <Link
                      href={cat.href}
                      className="text-white/90 transition-colors hover:text-brand"
                    >
                      {cat.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/wilayah"
                    className="text-white/90 transition-colors hover:text-brand"
                  >
                    Wilayah
                  </Link>
                </li>
              </ul>
            </nav>
            <Link
              href="/cari"
              aria-label="Pencarian"
              className="flex h-8 w-8 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/10 hover:text-brand"
            >
              <SearchIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
