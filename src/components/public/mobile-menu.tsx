"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { mainCategories } from "@/lib/navigation";

type Region = { slug: string; name: string; type: string };

/**
 * MobileMenu — hamburger + drawer kategori/wilayah/informasi (mobile).
 * Kategori dipindah ke drawer di mobile (03-HOMEPAGE-MOBILE.md), tidak di
 * navbar charcoal. Wilayah sebagai sub-daftar yang bisa dibuka.
 */
export function MobileMenu({ regions = [] }: { regions?: Region[] }) {
  const [open, setOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-md text-charcoal"
      >
        <span className="relative block h-4 w-5">
          <span className="absolute inset-x-0 top-0 h-0.5 bg-charcoal" />
          <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-charcoal" />
          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-charcoal" />
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85%] flex-col bg-base shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-line px-4">
              <span className="font-semibold">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="flex h-9 w-9 items-center justify-center rounded-md text-charcoal/70 hover:text-brand"
              >
                ✕
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4" aria-label="Menu mobile">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal/40">
                Kategori
              </p>
              <ul className="space-y-1">
                {mainCategories.map((cat) => (
                  <li key={cat.href}>
                    <Link
                      href={cat.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-brand"
                    >
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Wilayah: sub-daftar yang bisa dibuka */}
              <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-charcoal/40">
                Wilayah
              </p>
              {regions.length > 0 ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setRegionOpen((v) => !v)}
                    aria-expanded={regionOpen}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Pilih Wilayah
                    <span aria-hidden="true" className={regionOpen ? "rotate-180" : ""}>
                      ▾
                    </span>
                  </button>
                  {regionOpen && (
                    <ul className="mb-1 max-h-60 space-y-0.5 overflow-y-auto pl-2">
                      {regions.map((r) => (
                        <li key={r.slug}>
                          <Link
                            href={`/wilayah/${r.slug}`}
                            onClick={() => setOpen(false)}
                            className="block rounded-md px-3 py-1.5 text-sm text-charcoal/80 hover:bg-muted hover:text-brand"
                          >
                            {r.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href="/wilayah"
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-brand hover:bg-muted"
                  >
                    Semua Wilayah →
                  </Link>
                </div>
              ) : (
                <Link
                  href="/wilayah"
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-brand"
                >
                  Wilayah
                </Link>
              )}

              <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-charcoal/40">
                Informasi
              </p>
              <ul className="space-y-1">
                {[
                  { label: "Tentang", href: "/tentang" },
                  { label: "Redaksi", href: "/redaksi" },
                  { label: "Kontak", href: "/kontak" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-brand"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
