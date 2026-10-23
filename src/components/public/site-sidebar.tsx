import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { WibDate } from "@/components/common/wib-date";
import { SearchIcon } from "@/components/common/icons";
import { getRegionNav } from "@/lib/cms-data";
import { footerGroups, mainCategories } from "@/lib/navigation";
import { SocialIconRow } from "@/components/public/social-links";
import { SidebarNav } from "@/components/public/sidebar-nav";

// Sidebar memuat kelompok Tentang & Kerjasama; Legal cukup di footer
const sidebarGroups = footerGroups.slice(0, 2);

/**
 * SiteSidebar — navigasi utama desktop (≥ lg): kolom kiri sticky setinggi layar.
 * Logo → cari → kategori → wilayah → ikuti kami → tentang → kerjasama. Menggantikan topbar + header
 * putih + navbar charcoal (override design lock 2026-10-23, lihat CHANGELOG).
 * Di bawah lg, navigasi tetap lewat SiteHeader mobile + bottom nav.
 */
export async function SiteSidebar() {
  const regions = await getRegionNav();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 self-start overflow-y-auto bg-base lg:block">
      <div className="flex min-h-full flex-col gap-6 px-6 py-6">
        <BrandLogo height={88} priority />

        {/* Cari: form GET biasa ke /cari, tanpa JS */}
        <form action="/cari" role="search" className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/40" />
          <input
            type="search"
            name="q"
            placeholder="Cari berita…"
            aria-label="Kata kunci pencarian"
            className="w-full rounded-lg border border-line bg-muted py-2 pl-9 pr-3 text-sm outline-none focus:border-brand"
          />
        </form>

        <SidebarNav categories={mainCategories} regions={regions} />

        <div className="space-y-6 border-t border-line pt-6">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/40">
              Ikuti Kami
            </p>
            <SocialIconRow />
          </div>
          {sidebarGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/40">
                {group.title}
              </p>
              <ul className="space-y-2 text-sm text-charcoal/70">
                {group.links.map((item) => (
                  <li key={item.href + item.label}>
                    <Link href={item.href} className="transition-colors hover:text-brand">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-line pt-6 text-sm leading-relaxed text-charcoal/60">
          <p className="mb-2 font-semibold text-charcoal">Komitmen kami terhadap transparansi:</p>
          <p>
            Kami bekerja sesuai{" "}
            <Link href="/pedoman" className="underline underline-offset-2 hover:text-brand">
              Pedoman Media Siber
            </Link>{" "}
            dan{" "}
            <Link href="/syarat" className="underline underline-offset-2 hover:text-brand">
              Syarat &amp; Ketentuan
            </Link>{" "}
            kami: kekeliruan dikoreksi secara terbuka, dan hak jawab dilayani.
          </p>
        </div>

        <div className="mt-auto text-xs text-charcoal/50">
          <WibDate />
        </div>
      </div>
    </aside>
  );
}

