import Link from "next/link";
import { mobileBottomNav } from "@/lib/navigation";

/**
 * MobileBottomNav — fixed, selalu terlihat di mobile.
 * Beranda, Terbaru, Wilayah, Populer, Menu.
 * Menghormati safe-area; hanya tampil di layar kecil (< md).
 */
export function MobileBottomNav() {
  return (
    <nav
      aria-label="Navigasi utama mobile"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-base md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex h-[var(--h-bottomnav-mobile)] items-stretch">
        {mobileBottomNav.map((item) => (
          <li key={item.href + item.label} className="flex-1">
            <Link
              href={item.href}
              className="flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium text-charcoal/70 transition-colors hover:text-brand"
            >
              <span
                aria-hidden="true"
                className="h-5 w-5 rounded-full bg-charcoal/10"
              />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
