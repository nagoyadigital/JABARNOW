"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { Role } from "@prisma/client";
import { cmsNavGroups } from "@/lib/cms-navigation";
import { hasPermission, type Permission } from "@/lib/permissions";

/**
 * CmsMobileNav — hamburger + drawer menu CMS untuk layar < md.
 * Sidebar desktop menjadi drawer (13-CMS-MOBILE-AND-QA.md).
 */
export function CmsMobileNav({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka menu CMS"
        className="flex h-10 w-10 items-center justify-center rounded-md text-charcoal"
      >
        <span className="relative block h-4 w-5">
          <span className="absolute inset-x-0 top-0 h-0.5 bg-charcoal" />
          <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-charcoal" />
          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-charcoal" />
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <nav
            aria-label="Menu CMS"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col overflow-y-auto bg-charcoal p-4 text-white/80"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold text-white">Menu CMS</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup"
                className="h-9 w-9 rounded-md text-white/70"
              >
                ✕
              </button>
            </div>
            {cmsNavGroups.map((group) => {
              const items = group.items.filter(
                (i) => !i.permission || hasPermission(role, i.permission as Permission),
              );
              if (items.length === 0) return null;
              return (
                <div key={group.title} className="mb-4">
                  <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-white/40">
                    {group.title}
                  </p>
                  <ul className="mt-1 space-y-1">
                    {items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="block rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
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
        </div>
      )}
    </div>
  );
}
