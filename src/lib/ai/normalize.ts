/**
 * Normalisasi untuk dedup topik.
 * - URL kanonik: buang parameter pelacak & fragment → berita yang sama dari
 *   feed yang sama tidak masuk dua kali.
 * - titleKey: judul ternormalisasi → berita yang sama dari portal berbeda
 *   (judul identik/hampir identik) terdeteksi sebagai duplikat.
 */

const TRACKING_PARAMS = /^(utm_[a-z]+|fbclid|gclid|mc_cid|mc_eid|ref_src|_ga|igshid)$/i;

export function canonicalUrl(raw: string): string {
  try {
    const u = new URL(raw.trim());
    u.hash = "";
    u.hostname = u.hostname.toLowerCase();
    for (const key of [...u.searchParams.keys()]) {
      if (TRACKING_PARAMS.test(key)) u.searchParams.delete(key);
    }
    // Rapikan trailing slash (kecuali root)
    if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.replace(/\/+$/, "");
    }
    return u.toString();
  } catch {
    return raw.trim();
  }
}

// Kata umum yang tidak membedakan satu berita dengan berita lain
const STOPWORDS = new Set([
  "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "pada", "ini", "itu",
  "akan", "jadi", "dalam", "oleh", "atau", "juga", "karena", "agar", "saat",
  "the", "and", "for", "with", "from", "this", "that", "into",
  "video", "foto", "berita", "terkini", "viral",
]);

export function titleKey(title: string): string {
  const words = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
  // Urutkan agar "Banjir Bandung Selatan" == "Bandung Selatan Banjir"
  return [...new Set(words)].sort().slice(0, 14).join(" ");
}

/**
 * Validasi URL sumber yang boleh diambil server (cegah SSRF dasar):
 * hanya http/https dan bukan host lokal/privat.
 */
export function isFetchableUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  const h = u.hostname.toLowerCase();
  if (
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    h === "0.0.0.0" ||
    h === "[::1]" ||
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^169\.254\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h)
  ) {
    return false;
  }
  return true;
}
