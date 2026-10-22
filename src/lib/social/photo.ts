import { isFetchableUrl } from "@/lib/ai/normalize";
import { USER_AGENT } from "@/lib/ai/config";

/**
 * Ambil foto latar slide → data URI JPEG 1080px.
 * Dikerjakan sebelum render agar foto rusak/lambat tidak menggagalkan slide:
 * bila gagal, template otomatis memakai latar tipografi.
 */

const cache = new Map<string, { at: number; data: string | null }>();
const TTL_MS = 10 * 60_000;

export async function loadPhoto(url: string | null | undefined): Promise<string | null> {
  if (!url || !isFetchableUrl(url)) return null;
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;

  let data: string | null = null;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "image/*" },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (res.ok && (res.headers.get("content-type") ?? "").startsWith("image/")) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength <= 15 * 1024 * 1024) {
        // Normalisasi ke JPEG 1080px (Satori tidak mendukung semua format, mis. WebP/AVIF)
        try {
          const sharp = (await import("sharp")).default;
          const jpg = await sharp(buf)
            .rotate()
            .resize({ width: 1080, height: 1350, fit: "cover", position: "attention" })
            .jpeg({ quality: 82 })
            .toBuffer();
          data = `data:image/jpeg;base64,${jpg.toString("base64")}`;
        } catch {
          const type = res.headers.get("content-type") ?? "";
          if (/image\/(jpeg|png)/.test(type)) data = `data:${type};base64,${buf.toString("base64")}`;
        }
      }
    }
  } catch {
    data = null;
  }

  cache.set(url, { at: Date.now(), data });
  if (cache.size > 100) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  return data;
}
