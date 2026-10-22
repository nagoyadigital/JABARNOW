import { USER_AGENT } from "@/lib/ai/config";
import { isFetchableUrl } from "@/lib/ai/normalize";

/**
 * Ambil teks dari URL dengan batas waktu & ukuran.
 * Dipakai Scout (feed) dan pengambil og:image (potongan awal HTML).
 */
export async function fetchText(
  url: string,
  opts: { timeoutMs: number; maxBytes: number; accept?: string },
): Promise<string> {
  if (!isFetchableUrl(url)) throw new Error("URL tidak diizinkan");

  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: opts.accept ?? "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(opts.timeoutMs),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (res.url && !isFetchableUrl(res.url)) throw new Error("Redirect ke URL tidak diizinkan");
  if (!res.body) return "";

  // Baca bertahap; berhenti bila melewati batas ukuran
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > opts.maxBytes) {
      chunks.push(value.slice(0, value.byteLength - (total - opts.maxBytes)));
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }
  return new TextDecoder("utf-8").decode(Buffer.concat(chunks));
}

/** Cari og:image / twitter:image di potongan awal HTML artikel. */
export function extractOgImage(html: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::url)?["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image(?::url)?["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m && /^https?:\/\//i.test(m[1])) return m[1];
  }
  return null;
}
