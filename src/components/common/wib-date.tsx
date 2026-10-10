"use client";

import { useSyncExternalStore } from "react";

/**
 * WibDate — tanggal berjalan dalam zona Asia/Jakarta (WIB).
 * Dirender di klien agar tidak memaksa seluruh halaman menjadi dinamis
 * (Next.js 16 Cache Components). Server & hydration awal menampilkan kosong,
 * lalu klien mengisi tanggal nyata.
 */

function formatWib(withLabel: boolean): string {
  const formatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());
  return withLabel ? `${formatted} WIB` : formatted;
}

// Store eksternal: tanggal tidak berubah selama sesi render, jadi subscribe no-op.
const subscribe = () => () => {};

export function WibDate({ withLabel = true }: { withLabel?: boolean }) {
  const text = useSyncExternalStore(
    subscribe,
    () => formatWib(withLabel), // snapshot klien
    () => "", // snapshot server (kosong, dihindari mismatch)
  );

  return <span suppressHydrationWarning>{text || "\u00A0"}</span>;
}
