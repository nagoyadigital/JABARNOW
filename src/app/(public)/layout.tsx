import { SiteHeader } from "@/components/public/site-header";
import { SiteSidebar } from "@/components/public/site-sidebar";
import { SiteFooter } from "@/components/public/site-footer";
import { Suspense } from "react";
import { PageTransition } from "@/components/public/page-transition";
import { StickyBottomAd } from "@/components/public/sticky-bottom-ad";

/**
 * Layout shell publik.
 * Desktop (≥ lg): [sidebar navigasi kiri sticky │ konten] → footer selebar layar.
 * Mobile/tablet: header atas (menu lewat drawer) → konten → footer.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Aksesibilitas: lompat langsung ke konten untuk pengguna keyboard/pembaca layar */}
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-charcoal focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Lewati ke konten
      </a>
      <div className="flex flex-1">
        <SiteSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <SiteHeader />
          <main id="konten" tabIndex={-1} className="flex-1 outline-none">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
      {/* Footer selebar layar (di bawah sidebar juga) */}
      <SiteFooter />
      {/* Banner iklan melayang bawah (placement FOOTER), bisa ditutup */}
      <Suspense fallback={null}>
        <StickyBottomAd />
      </Suspense>
    </div>
  );
}
