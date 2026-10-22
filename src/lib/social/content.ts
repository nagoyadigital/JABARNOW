import { z } from "zod";

/**
 * Bentuk data paket sosmed + util teks murni (tanpa I/O) — mudah diuji.
 */

export const slideSchema = z.object({
  kind: z.enum(["cover", "point", "cta"]),
  title: z.string().max(120).optional(),
  body: z.string().max(400).optional(),
});
export type Slide = z.infer<typeof slideSchema>;
export const slidesSchema = z.array(slideSchema).min(1).max(8);

/** Baca kolom JSON slides dengan aman (data rusak → array kosong). */
export function parseSlides(raw: unknown): Slide[] {
  const parsed = slidesSchema.safeParse(raw);
  return parsed.success ? parsed.data : [];
}

/** Ambil paragraf teks dari konten Tiptap JSON (abaikan gambar, embed, tabel). */
export function tiptapParagraphs(json: unknown): string[] {
  const out: string[] = [];
  const walkText = (node: unknown): string => {
    if (!node || typeof node !== "object") return "";
    const n = node as { type?: string; text?: string; content?: unknown[] };
    if (n.type === "text") return n.text ?? "";
    if (n.type === "hardBreak") return " ";
    return (n.content ?? []).map(walkText).join("");
  };
  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const n = node as { type?: string; content?: unknown[] };
    if (n.type === "paragraph" || n.type === "listItem") {
      const t = walkText(n).replace(/\s+/g, " ").trim();
      if (t) out.push(t);
      return;
    }
    if (n.type === "table" || n.type === "image" || n.type === "codeBlock") return;
    (n.content ?? []).forEach(visit);
  };
  visit(json);
  return out;
}

/** Pecah teks jadi kalimat (sederhana, cukup untuk bahasa Indonesia berita). */
export function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Potong teks di batas kata, tambahkan elipsis bila terpotong. */
export function clipWords(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const at = cut.lastIndexOf(" ");
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[,;:\s]+$/, "")}…`;
}

/** Buang dateline "BANDUNG, JabarNow! —" di awal paragraf pertama. */
export function stripDateline(text: string): string {
  return text.replace(/^[A-Z][A-Z .'-]{2,40},\s*JabarNow!?\s*[—–-]\s*/u, "").trim();
}

/** Ubah label bebas jadi hashtag: "Kota Bandung" → "#KotaBandung". */
export function toHashtag(label: string): string | null {
  const words = label
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return null;
  const tag = words.map((w) => w[0].toUpperCase() + w.slice(1)).join("");
  return tag.length >= 2 && tag.length <= 40 ? `#${tag}` : null;
}

export function uniqueHashtags(tags: (string | null | undefined)[], max = 10): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    if (!raw) continue;
    const t = raw.startsWith("#") ? raw : toHashtag(raw);
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

/** Headline sosmed: rapikan & batasi panjang agar muat di slide. */
export function socialHeadline(title: string): string {
  return clipWords(title.replace(/\s+/g, " ").trim(), 110);
}

/**
 * Bangun slide carousel tanpa AI: cover + N poin dari paragraf awal + CTA.
 * Tiap poin = 1–2 kalimat pertama paragraf, maks ~220 karakter.
 */
export function buildRuleSlides(input: {
  headline: string;
  paragraphs: string[];
  points: number;
  ctaTitle: string;
  ctaText: string;
}): Slide[] {
  const cover: Slide = { kind: "cover", title: input.headline };
  const cta: Slide = { kind: "cta", title: input.ctaTitle, body: input.ctaText };
  const bodies: string[] = [];
  for (const [i, raw] of input.paragraphs.entries()) {
    if (bodies.length >= input.points) break;
    const p = i === 0 ? stripDateline(raw) : raw;
    const ss = sentences(p);
    if (ss.length === 0) continue;
    let body = ss[0];
    if (ss[1] && body.length + ss[1].length < 200) body = `${body} ${ss[1]}`;
    body = clipWords(body, 230);
    if (body.length < 40) continue; // terlalu pendek untuk satu slide
    bodies.push(body);
  }
  return [cover, ...bodies.map((body): Slide => ({ kind: "point", body })), cta];
}
