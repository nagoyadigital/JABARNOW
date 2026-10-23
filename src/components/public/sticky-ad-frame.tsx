"use client";

import { useState } from "react";
import { CloseIcon } from "@/components/common/icons";

/**
 * StickyAdFrame — bingkai banner iklan melayang di bawah layar dengan tombol
 * tutup. Setelah ditutup tetap tersembunyi selama sesi navigasi (layout
 * tidak di-remount); muncul lagi saat halaman dimuat ulang.
 */
export function StickyAdFrame({ children }: { children: React.ReactNode }) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center px-3 motion-safe:animate-[jn-ad-up_500ms_cubic-bezier(.22,1,.36,1)_both] lg:bottom-5 lg:pl-60">
      <div className="pointer-events-auto relative w-full max-w-[970px] rounded-2xl bg-base p-1 shadow-[0_12px_40px_-12px_rgba(23,25,29,0.45)]">
        {children}
        <button
          type="button"
          onClick={() => setClosed(true)}
          aria-label="Tutup iklan"
          className="absolute -right-2 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-charcoal text-white shadow-md transition-transform hover:scale-110"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
