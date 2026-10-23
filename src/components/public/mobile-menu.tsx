"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SocialIconRow } from "@/components/public/social-links";
import { ChevronRightIcon, CloseIcon, SearchIcon } from "@/components/common/icons";
import { footerGroups, mainCategories } from "@/lib/navigation";

type Region = { slug: string; name: string; type: string };

// Tautan informasi di kaki drawer: gabungan kelompok footer, tanpa label ganda
const infoLinks = footerGroups
  .flatMap((g) => g.links)
  .filter((l, i, all) => all.findIndex((x) => x.label === l.label) === i);

/**
 * MobileMenu — hamburger + drawer navigasi mobile/tablet (< lg).
 * Isi drawer: logo + tutup → cari → kategori (›) → wilayah (bisa dibuka)
 * → Ikuti Kami → tautan informasi. Drawer meluncur dari kiri, latar
 * memudar + blur; selalu ter-render agar buka & tutup sama-sama beranimasi.
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

  const close = () => setOpen(false);
  const rowCls =
    "flex items-center justify-between rounded-lg px-3 py-3 text-[15px] font-bold uppercase tracking-wide transition-colors active:bg-muted hover:text-brand";

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
          <span className="absolute inset-x-0 top-0 h-0.5 rounded bg-charcoal" />
          <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded bg-charcoal" />
          <span className="absolute inset-x-0 bottom-0 h-0.5 rounded bg-charcoal" />
        </span>
      </button>

      <div
        className={`fixed inset-0 z-[60] lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
        inert={!open}
      >
        {/* Backdrop: memudar + blur */}
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={close}
          className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        />
        {/* Drawer: meluncur dari kiri */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          // Klik tautan mana pun di drawer (termasuk logo) → tutup drawer
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) close();
          }}
          className={`absolute inset-y-0 left-0 flex w-[340px] max-w-[85%] flex-col bg-base shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-6 pb-2 pt-5">
            <BrandLogo height={44} />
            <button
              type="button"
              onClick={close}
              aria-label="Tutup menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-muted"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-8">
            <form action="/cari" role="search" className="relative mt-4">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/40" />
              <input
                type="search"
                name="q"
                placeholder="Cari berita…"
                aria-label="Kata kunci pencarian"
                className="w-full rounded-xl border border-line bg-muted py-3 pl-11 pr-4 text-sm outline-none focus:border-brand"
              />
            </form>

            <nav aria-label="Menu mobile" className="mt-5">
              <ul className="-mx-3">
                {mainCategories.map((cat) => (
                  <li key={cat.href}>
                    <Link href={cat.href} className={rowCls}>
                      {cat.label}
                      <ChevronRightIcon className="h-4 w-4 text-charcoal/50" />
                    </Link>
                  </li>
                ))}
                <li>
                  {regions.length > 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setRegionOpen((v) => !v)}
                        aria-expanded={regionOpen}
                        className={`${rowCls} w-full`}
                      >
                        Wilayah
                        <ChevronRightIcon
                          className={`h-4 w-4 text-charcoal/50 transition-transform duration-300 ${regionOpen ? "rotate-90" : ""}`}
                        />
                      </button>
                      {/* Daftar wilayah: tinggi beranimasi lewat grid-rows 0fr → 1fr */}
                      <div
                        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
                          regionOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <ul className="overflow-hidden px-3">
                          {regions.map((r) => (
                            <li key={r.slug}>
                              <Link
                                href={`/wilayah/${r.slug}`}
                                onClick={close}
                                className="block py-1.5 text-sm text-charcoal/70 hover:text-brand"
                              >
                                {r.name}
                              </Link>
                            </li>
                          ))}
                          <li>
                            <Link
                              href="/wilayah"
                              onClick={close}
                              className="block py-2 text-sm font-semibold text-brand"
                            >
                              Semua Wilayah →
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <Link href="/wilayah" className={rowCls}>
                      Wilayah
                      <ChevronRightIcon className="h-4 w-4 text-charcoal/50" />
                    </Link>
                  )}
                </li>
              </ul>
            </nav>

            <div className="mt-5 border-t border-line pt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/40">
                Ikuti Kami
              </p>
              <SocialIconRow size="md" />
            </div>

            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5 text-sm text-charcoal/60">
              {infoLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-brand">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
