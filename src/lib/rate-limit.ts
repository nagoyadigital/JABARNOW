/**
 * Pembatas laju sederhana di memori (fixed window per kunci).
 * Cukup untuk satu instance PM2 (lihat ecosystem.config.js). Bila nanti
 * dijalankan multi-instance/cluster, ganti penyimpanannya ke Redis/DB.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateResult = { allowed: boolean; remaining: number; retryAfterSec: number };

/** Catat satu percobaan untuk `key`. Mengembalikan apakah masih diizinkan. */
export function hit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  b.count += 1;
  // Bersihkan entri kedaluwarsa sesekali agar memori tidak membengkak
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }
  return {
    allowed: b.count <= limit,
    remaining: Math.max(0, limit - b.count),
    retryAfterSec: Math.ceil((b.resetAt - now) / 1000),
  };
}

/** Cek tanpa menambah hitungan. */
export function isBlocked(key: string, limit: number): boolean {
  const b = buckets.get(key);
  return Boolean(b && b.resetAt > Date.now() && b.count >= limit);
}

/** Hapus hitungan (mis. setelah login berhasil). */
export function reset(key: string): void {
  buckets.delete(key);
}

/** Ambil IP klien dari header proxy (Nginx meneruskan X-Forwarded-For / X-Real-IP). */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
