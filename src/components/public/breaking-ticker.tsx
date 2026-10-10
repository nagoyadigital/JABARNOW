"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

type Item = { label: string; href: string };

/**
 * BreakingTicker — AUTO-ADVANCE (berganti otomatis tiap ~5 dtk) + kontrol manual.
 * CATATAN: ini meng-override design lock "ticker manual" atas keputusan pemilik
 * proyek (lihat CHANGELOG). Auto-advance berhenti saat hover/fokus dan dinonaktifkan
 * bila pengguna memilih prefers-reduced-motion (aksesibilitas).
 * Keadaan kosong menyembunyikan modul.
 */
const INTERVAL_MS = 5000;

export function BreakingTicker({ items }: { items: Item[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  const go = useCallback(
    (dir: 1 | -1) =>
      setIndex((i) => (i + dir + items.length) % items.length),
    [items.length],
  );

  // Deteksi prefers-reduced-motion (nonaktifkan auto bila aktif)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = mq.matches;
    const onChange = () => (reducedMotion.current = mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Auto-advance (berhenti saat paused / reduced-motion / item tunggal)
  useEffect(() => {
    if (paused || reducedMotion.current || items.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, items.length]);

  if (!items.length) return null;

  const current = items[index];

  return (
    <div
      className="border-b border-line bg-base"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="container-jn flex h-[var(--h-ticker)] items-center gap-3">
        <span className="shrink-0 rounded bg-breaking px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          Breaking
        </span>
        <Link
          href={current.href}
          className="min-w-0 flex-1 truncate text-sm font-medium text-charcoal transition-opacity hover:text-brand"
          aria-live="polite"
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
