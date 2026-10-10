/**
 * Util format tanggal/waktu editorial WIB (Asia/Jakarta).
 */

export function formatWibDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

/** Tanggal + jam lengkap WIB: "10 Oktober 2026, 14.30 WIB". */
export function formatWibDateTime(iso: string): string {
  const s = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
  return `${s} WIB`;
}

/** Estimasi waktu baca (menit) dari jumlah kata; min 1 menit (~200 wpm). */
export function readingTimeMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Waktu relatif singkat: "5 mnt lalu", "3 jam lalu", "2 hari lalu". */
export function timeAgoWib(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min} mnt lalu`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day} hari lalu`;
  return formatWibDate(iso);
}
