"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

type Item = { label: string; href: string };

/**
 * BreakingTicker — AUTO otomatis murni dengan transisi fade+slide halus.
 * Tanpa tombol manual (keputusan pemilik proyek; lihat CHANGELOG-DESIGN-LOCK).
 * Hormati prefers-reduced-motion: bila aktif, berganti tanpa animasi.
 * Keadaan kosong menyembunyikan modul.
 */
const INTERVAL_MS = 4500;
const ANIM_MS = 500;

export function BreakingTicker({ items }: { items: Item[] }) {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;
    const onChange = () => (reduced.current = mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => {
      if (reduced.current) {
        // Tanpa animasi: langsung ganti
        setIndex((i) => (i + 1) % items.length);
        return;
      }
      // Animasi keluar → ganti teks → animasi masuk
      setAnimating(true);
      const t = setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setAnimating(false);
      }, ANIM_MS);
      return () => clearTimeout(t);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;

  const current = items[index];

  return (
    <div className="overflow-hidden border-b border-line bg-base">
      <div className="container-jn flex h-[var(--h-ticker)] items-center gap-3">
        <span className="shrink-0 rounded bg-breaking px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          Breaking
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <Link
            href={current.href}
            aria-live="polite"
            className="block truncate text-sm font-medium text-charcoal transition-all duration-500 ease-out hover:text-brand"
            style={{
              transitionDuration: `${ANIM_MS}ms`,
              opacity: animating ? 0 : 1,
              transform: animating ? "translateY(-60%)" : "translateY(0)",
            }}
          >
            {current.label}
          </Link>
        </div>
        {/* Indikator progres kecil (dot) untuk konteks visual */}
        {items.length > 1 && (
          <div className="flex shrink-0 items-center gap-1" aria-hidden="true">
            {items.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-4 bg-breaking" : "w-1.5 bg-line"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
