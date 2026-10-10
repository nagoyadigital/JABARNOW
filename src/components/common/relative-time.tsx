"use client";

import { useSyncExternalStore } from "react";
import { formatWibDate, timeAgoWib } from "@/lib/format";

/**
 * RelativeTime — menampilkan waktu relatif WIB di klien (menghindari
 * Date.now() saat prerender, Next.js 16 Cache Components).
 * Server & hydration awal menampilkan tanggal absolut (deterministik, SEO-friendly),
 * lalu klien menggantinya dengan "x jam lalu".
 */
const subscribe = () => () => {};

export function RelativeTime({ iso }: { iso: string }) {
  const label = useSyncExternalStore(
    subscribe,
    () => timeAgoWib(iso), // klien: relatif
    () => formatWibDate(iso), // server: absolut
  );

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {label}
    </time>
  );
}
