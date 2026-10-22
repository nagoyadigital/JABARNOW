import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { MobileBottomNav } from "@/components/public/mobile-bottom-nav";

/**
 * Layout shell publik: header → konten → footer → bottom nav (mobile).
 * Padding bawah di mobile agar bottom nav tidak menutupi footer/konten.
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
      <SiteHeader />
      <main id="konten" tabIndex={-1} className="flex-1 outline-none pb-[calc(var(--h-bottomnav-mobile)+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
