"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/common/icons";

/**
 * SearchOverlay — tombol ikon search yang membuka kotak pencarian melayang.
 * Tutup dengan Escape / klik backdrop. Submit menuju /cari?q=...
 * Mengelola fokus (autofocus input saat terbuka) & hormati aksesibilitas.
 */
export function SearchOverlay({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // Fokus input saat overlay muncul
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    router.push(`/cari?q=${encodeURIComponent(term)}`);
  };

  const triggerCls =
    variant === "dark"
      ? "flex h-8 w-8 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/10 hover:text-brand"
      : "flex h-10 w-10 items-center justify-center rounded-md text-charcoal transition-colors hover:text-brand";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka pencarian"
        className={triggerCls}
      >
        <SearchIcon className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-24 sm:pt-32">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Tutup pencarian"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          {/* Kotak search */}
          <form
            onSubmit={submit}
            role="search"
            className="relative w-full max-w-xl rounded-[var(--radius-card)] bg-base p-2 shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <SearchIcon className="ml-2 h-5 w-5 shrink-0 text-charcoal/40" />
              <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari berita, topik, atau wilayah…"
                aria-label="Kata kunci pencarian"
                className="w-full bg-transparent px-1 py-2.5 text-base outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90"
              >
                Cari
              </button>
            </div>
            <p className="px-3 pb-1 pt-1 text-[11px] text-charcoal/40">
              Tekan Enter untuk mencari · Esc untuk menutup
            </p>
          </form>
        </div>
      )}
    </>
  );
}
