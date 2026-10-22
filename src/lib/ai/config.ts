/**
 * Konfigurasi AI Desk. Nilai default aman; bisa di-override lewat env
 * tanpa mengubah kode. (Pengaturan dari CMS menyusul di Tahap 12.)
 */

function intEnv(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

export const scoutConfig = {
  /** Item feed lebih tua dari ini diabaikan (jam). */
  maxAgeHours: intEnv("AI_SCOUT_MAX_AGE_HOURS", 48),
  /** Jendela dedup judul lintas portal (jam). */
  titleDedupHours: intEnv("AI_SCOUT_TITLE_DEDUP_HOURS", 72),
  /** Maksimal item yang diambil per sumber per putaran. */
  maxItemsPerSource: intEnv("AI_SCOUT_MAX_ITEMS_PER_SOURCE", 40),
  /** Maksimal artikel yang dicek og:image-nya per putaran (hemat bandwidth). */
  ogImageLimit: intEnv("AI_SCOUT_OG_IMAGE_LIMIT", 15),
  /** Batas waktu ambil feed (ms). */
  fetchTimeoutMs: intEnv("AI_SCOUT_FETCH_TIMEOUT_MS", 15000),
  /** Batas ukuran feed (byte). */
  maxFeedBytes: 3 * 1024 * 1024,
  /** Jumlah sumber yang diambil bersamaan. */
  concurrency: 4,
} as const;

export const USER_AGENT =
  "JabarNowBot/1.0 (+https://jabarnow.id; redaksi) Mozilla/5.0 compatible";
