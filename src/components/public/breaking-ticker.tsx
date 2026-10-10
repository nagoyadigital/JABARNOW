"use client";

import Link from "next/link";
import { useState } from "react";

type Item = { label: string; href: string };

/**
 * BreakingTickerManual — navigasi next/previous MANUAL (bukan marquee otomatis).
 * Keadaan kosong menyembunyikan modul (04-COMPONENTS-AND-STATES.md).
 */
export function BreakingTicker({ items }: { items: Item[] }) {
  const [index, setIndex] = useState(0);

  if (!items.length) return null; // empty state: sembunyikan modul

  const current = items[index];
  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + items.length) % items.length);

  return (
    <div className="border-b border-line bg-base">
      <div className="container-jn flex h-[var(--h-ticker)] items-center gap-3">
        <span className="shrink-0 rounded bg-breaking px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          Breaking
        </span>
        <Link
          href={current.href}
          className="min-w-0 flex-1 truncate text-sm font-medium text-charcoal hover:text-brand"
        >
          {current.label}
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Breaking sebelumnya"
            className="flex h-7 w-7 items-center justify-center rounded border border-line text-charcoal/60 hover:border-brand hover:text-brand"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Breaking berikutnya"
            className="flex h-7 w-7 items-center justify-center rounded border border-line text-charcoal/60 hover:border-brand hover:text-brand"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
