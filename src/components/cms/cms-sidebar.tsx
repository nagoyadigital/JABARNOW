import Link from "next/link";
import type { Role } from "@prisma/client";
import { BrandLogo } from "@/components/brand/brand-logo";
import { cmsNavGroups } from "@/lib/cms-navigation";
import { hasPermission, type Permission } from "@/lib/permissions";

/**
 * CmsSidebar — sidebar kiri charcoal, baseline 248px.
 * Menu disembunyikan bila permission tidak cukup (visibilitas mengikuti izin).
 * Enforcement sesungguhnya tetap server-side di tiap halaman.
 */
export function CmsSidebar({ role }: { role: Role }) {
  return (
    <aside className="hidden w-[var(--w-cms-sidebar)] shrink-0 flex-col bg-charcoal text-white/80 md:flex">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <BrandLogo height={32} />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Menu CMS">
        {cmsNavGroups.map((group) => {
          const items = group.items.filter(
            (item) =>
              !item.permission ||
              hasPermission(role, item.permission as Permission),
          );
          if (items.length === 0) return null;
          return (
            <div key={group.title} className="mb-5">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-white/40">
                {group.title}
              </p>
              <ul className="mt-2 space-y-1">
                {items.map((item) => (
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
          );
        })}
      </nav>
    </aside>
  );
}
