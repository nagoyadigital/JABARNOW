"use client";

import { ViewTransition } from "react";
import { usePathname } from "next/navigation";

/**
 * PageTransition — animasi pergantian halaman lewat View Transitions API:
 * konten lama memudar keluar cepat, konten baru naik halus. Sidebar, header,
 * dan footer tetap diam (tidak dibungkus). Key = pathname agar setiap
 * navigasi menjadi pasangan exit/enter. CSS-nya di globals.css (.jn-page).
 * Browser tanpa dukungan: halaman berganti biasa tanpa animasi.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter="jn-page" exit="jn-page" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
