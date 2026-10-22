import { createHmac, timingSafeEqual } from "node:crypto";
import { siteConfig } from "@/lib/site-config";

/**
 * URL gambar slide bertanda tangan (HMAC).
 * Gambar bisa dibuka tanpa login (dibutuhkan Instagram/Meta saat posting),
 * tapi URL tidak bisa ditebak/dipalsukan untuk post lain.
 */

function secret(): string {
  const s = process.env.AUTH_SECRET || process.env.CRON_SECRET;
  if (!s) throw new Error("AUTH_SECRET belum diisi");
  return s;
}

function signature(id: string, slide: number, version: string): string {
  return createHmac("sha256", secret())
    .update(`sosmed:${id}:${slide}:${version}`)
    .digest("base64url")
    .slice(0, 32);
}

export function verifySlideSignature(id: string, slide: number, version: string, sig: string): boolean {
  try {
    const a = Buffer.from(signature(id, slide, version));
    const b = Buffer.from(sig);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Versi gambar = waktu edit post + waktu edit Brand Kit. Berubah setiap ada
 * perubahan, sehingga cache browser/CDN otomatis memakai gambar baru.
 */
export function renderVersion(postUpdatedAt: Date, brandKitVersion: number): string {
  return `${postUpdatedAt.getTime()}.${brandKitVersion}`;
}

/** Path relatif gambar slide (untuk <img> di CMS). */
export function slideImagePath(id: string, slide: number, version: string): string {
  return `/api/sosmed/render/${id}/${slide}?v=${version}&s=${signature(id, slide, version)}`;
}

/** URL absolut gambar slide (untuk API platform sosmed). */
export function slideImageUrl(id: string, slide: number, version: string): string {
  return `${siteConfig.url.replace(/\/+$/, "")}${slideImagePath(id, slide, version)}`;
}
