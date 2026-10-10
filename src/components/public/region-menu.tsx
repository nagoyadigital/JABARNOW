"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

type Region = { slug: string; name: string; type: string };

/**
 * RegionMenu — item navbar "Wilayah" dengan dropdown mega-menu.
 * Daftar kab/kota dari DB, dikelompokkan Kota & Kabupaten + link Semua Wilayah.
 * Buka saat hover/klik; tutup via Escape / klik luar. (04-COMPONENTS: RegionMenu)
 */
export function RegionMenu({ regions }: { regions: Region[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  // Jika data wilayah kosong, jadikan tautan biasa ke /wilayah
  if (regions.length === 0) {
    return (
      <Link href="/wilayah" className="text-white/90 transition-colors hover:text-brand">
        Wilayah
      </Link>
    );
  }

  const kota = regions.filter((r) => r.type === "KOTA");
  const kabupaten = regions.filter((r) => r.type === "KABUPATEN");

  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1 text-white/90 transition-colors hover:text-brand"
      >
        Wilayah
        <span
          aria-hidden="true"
          className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 pt-2">
          <div className="w-[560px] max-w-[90vw] rounded-[var(--radius-card)] border border-line bg-base p-4 text-charcoal shadow-xl">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <RegionGroup title="Kota" items={kota} onNavigate={() => setOpen(false)} />
              <RegionGroup title="Kabupaten" items={kabupaten} onNavigate={() => setOpen(false)} />
            </div>
            <div className="mt-3 border-t border-line pt-3">
              <Link
                href="/wilayah"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-brand hover:underline"
              >
                Lihat Semua Wilayah →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RegionGroup({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: Region[];
  onNavigate: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-charcoal/40">
        {title}
      </p>
      <ul className="max-h-72 overflow-y-auto">
        {items.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/wilayah/${r.slug}`}
              onClick={onNavigate}
              className="block rounded px-2 py-1 text-sm text-charcoal/80 hover:bg-muted hover:text-brand"
            >
              {r.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
