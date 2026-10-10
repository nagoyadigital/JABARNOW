import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { cmsNavGroups } from "@/lib/cms-navigation";

/**
 * CmsSidebar — sidebar kiri charcoal, baseline 248px.
 * Active menu orange; item disembunyikan jika permission tidak cukup
 * (enforcement server-side ditambahkan di Tahap 3).
 */
export function CmsSidebar() {
  return (
    <aside className="hidden w-[var(--w-cms-sidebar)] shrink-0 flex-col bg-charcoal text-white/80 md:flex">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <BrandLogo height={32} />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Menu CMS">
        {cmsNavGroups.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-white/40">
              {group.title}
            </p>
            <ul className="mt-2 space-y-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
