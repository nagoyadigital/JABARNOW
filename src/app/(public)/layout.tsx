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
      <SiteHeader />
      <main className="flex-1 pb-[calc(var(--h-bottomnav-mobile)+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
