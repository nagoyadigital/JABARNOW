import { z } from "zod";
import type { SocialFormat } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";
import { getBrandKit, type BrandKit } from "@/lib/social/brand-kit";
import {
  buildRuleSlides,
  clipWords,
  socialHeadline,
  stripDateline,
  tiptapParagraphs,
  uniqueHashtags,
  type Slide,
} from "@/lib/social/content";
import { complete, extractJson, isAiConfigured } from "@/lib/ai/llm";
import { finishRun, startRun } from "@/lib/ai/agent-run";

/**
 * Generator paket sosmed dari artikel: feed 1 slide + carousel.
 *
 * - Dengan AI (AI_API_KEY terisi): headline sosmed + 2 alternatif, kata
 *   sorotan, kicker, poin carousel, caption & hashtag ditulis AI dari isi
 *   artikel yang SUDAH disetujui redaksi.
 * - Tanpa AI: disusun otomatis dari judul, excerpt, dan paragraf awal.
 * Hasil selalu masuk status PENDING_REVIEW (dicek redaksi dulu).
 */

type ArticleForSocial = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentJson: unknown;
  ogImageUrl: string | null;
  category: { name: string } | null;
  region: { name: string } | null;
  cover: { url: string } | null;
  tags: { tag: { name: string } }[];
};

type Copy = {
  kicker: string | null;
  headline: string;
  headlineAlts: string[];
  highlight: string | null;
  points: string[];
  caption: string;
  hashtags: string[];
  generatedBy: string;
};

const aiSchema = z.object({
  kicker: z.string().max(30).nullish(),
  headline: z.string().min(10).max(120),
  headline_alternatif: z.array(z.string().min(10).max(120)).max(3).default([]),
  sorotan: z.string().max(40).nullish(),
  poin: z.array(z.string().min(20).max(260)).min(1).max(5),
  caption: z.string().min(40).max(2000),
  hashtags: z.array(z.string().min(2).max(40)).max(12).default([]),
});

const SYSTEM_PROMPT = `Kamu editor media sosial JabarNow!, portal berita Jawa Barat. Tugasmu mengubah artikel yang SUDAH disetujui redaksi menjadi konten Instagram/TikTok/Threads/Facebook.

ATURAN FAKTA (wajib):
- Pakai HANYA fakta dari ARTIKEL. Jangan menambah angka, nama, kutipan, atau klaim baru.
- Jangan memelintir makna. Headline harus bisa dipertanggungjawabkan oleh isi artikel.
- Kode Etik Jurnalistik: praduga tak bersalah, samarkan identitas korban/anak, hindari SARA dan detail sadis.

GAYA:
- Headline sosmed 50-90 karakter, kuat dan jelas, bahasa Indonesia yang enak dibaca. Boleh lebih hidup dari judul website, tapi TANPA clickbait menyesatkan ("Bikin Kaget", "Ternyata...").
- Untuk berita kriminal, bencana, politik, kesehatan: nada lugas, tanpa tanda seru.
- "sorotan": 1-2 kata yang PERSIS ada di headline untuk diberi warna aksen (nama tempat, angka, atau kata kunci). Boleh null.
- "kicker": label pendek 1-2 kata (mis. "BANDUNG", "LALU LINTAS", "PERSIB").
- "poin": {{POIN}} poin untuk slide carousel, masing-masing 1-2 kalimat (maks 220 karakter), berdiri sendiri, urut dari yang terpenting.
- "caption": kalimat pembuka yang menarik + ringkasan 2-3 kalimat + ajakan "Baca selengkapnya di jabarnow.id (link di bio)." Tanpa hashtag di dalam caption.
- "hashtags": 5-8 hashtag relevan (wilayah, topik), diawali #.

KELUARKAN JSON SAJA:
{"kicker": string|null, "headline": string, "headline_alternatif": [string, string], "sorotan": string|null, "poin": [string], "caption": string, "hashtags": [string]}`;

function articleLink(slug: string): string {
  return `${siteConfig.url.replace(/\/+$/, "")}/artikel/${slug}`;
}

function ruleCopy(a: ArticleForSocial, kit: BrandKit, paragraphs: string[]): Copy {
  const headline = socialHeadline(a.title);
  const lead = a.excerpt?.trim() || stripDateline(paragraphs[0] ?? "");
  const caption = [
    clipWords(lead, 400),
    `Baca selengkapnya di ${siteConfig.url.replace(/^https?:\/\//, "")} (link di bio).`,
  ]
    .filter(Boolean)
    .join("\n\n");
  const slides = buildRuleSlides({
    headline,
    paragraphs,
    points: kit.carouselPoints,
    ctaTitle: kit.ctaTitle,
    ctaText: kit.ctaText,
  });
  return {
    kicker: (a.region?.name.replace(/^(Kota|Kabupaten)\s+/, "") ?? a.category?.name ?? null)?.toUpperCase() ?? null,
    headline,
    headlineAlts: [],
    highlight: null,
    points: slides.filter((s) => s.kind === "point").map((s) => s.body ?? ""),
    caption,
    hashtags: uniqueHashtags([
      ...kit.baseHashtags,
      a.region?.name,
      a.category?.name,
      ...a.tags.map((t) => t.tag.name),
    ], 10),
    generatedBy: "rules",
  };
}

async function aiCopy(a: ArticleForSocial, kit: BrandKit, paragraphs: string[]): Promise<Copy> {
  const run = await startRun("COPYWRITER", "sosmed");
  try {
    const body = paragraphs.join("\n\n").slice(0, 12_000);
    const res = await complete({
      system: SYSTEM_PROMPT.replace("{{POIN}}", String(kit.carouselPoints)),
      user: [
        `JUDUL: ${a.title}`,
        a.category ? `KATEGORI: ${a.category.name}` : "",
        a.region ? `WILAYAH: ${a.region.name}` : "",
        a.excerpt ? `RINGKASAN: ${a.excerpt}` : "",
        `ARTIKEL:\n${body}`,
      ]
        .filter(Boolean)
        .join("\n"),
      maxTokens: 1500,
      json: true,
    });
    const parsed = aiSchema.parse(extractJson(res.text));
    const headline = socialHeadline(parsed.headline);
    const highlight =
      parsed.sorotan && headline.toLowerCase().includes(parsed.sorotan.toLowerCase())
        ? parsed.sorotan
        : null;
    await finishRun(run.id, {
      status: "OK",
      items: 1,
      tokensIn: res.tokensIn,
      tokensOut: res.tokensOut,
      costUsd: res.costUsd,
      summary: `Paket sosmed: ${clipWords(a.title, 80)}`,
    });
    return {
      kicker: parsed.kicker?.toUpperCase() ?? null,
      headline,
      headlineAlts: parsed.headline_alternatif.map(socialHeadline).filter((h) => h !== headline).slice(0, 3),
      highlight,
      points: parsed.poin.slice(0, kit.carouselPoints).map((p) => clipWords(p, 260)),
      caption: parsed.caption.trim(),
      hashtags: uniqueHashtags([...kit.baseHashtags, ...parsed.hashtags], 10),
      generatedBy: `ai:${res.model}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await finishRun(run.id, { status: "ERROR", error: `Sosmed AI gagal, pakai template otomatis: ${message.slice(0, 300)}` });
    throw err;
  }
}

function slidesFor(format: SocialFormat, copy: Copy, kit: BrandKit): Slide[] {
  const cover: Slide = { kind: "cover", title: copy.headline };
  if (format === "SINGLE") return [cover];
  return [
    cover,
    ...copy.points.filter(Boolean).map((body): Slide => ({ kind: "point", body })),
    { kind: "cta", title: kit.ctaTitle, body: kit.ctaText },
  ];
}

async function loadArticle(articleId: string): Promise<ArticleForSocial | null> {
  return prisma.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      contentJson: true,
      ogImageUrl: true,
      category: { select: { name: true } },
      region: { select: { name: true } },
      cover: { select: { url: true } },
      tags: { select: { tag: { select: { name: true } } } },
    },
  });
}

/**
 * Pastikan artikel punya paket sosmed (feed + carousel).
 * - force=false: hanya membuat yang belum ada (aman dipanggil berulang).
 * - force=true : tulis ulang teks kedua format (status kembali PENDING_REVIEW).
 * Mengembalikan jumlah post yang dibuat/diperbarui.
 */
export async function ensureSocialPackage(
  articleId: string,
  opts: { force?: boolean } = {},
): Promise<number> {
  const existing = await prisma.socialPost.findMany({
    where: { articleId },
    select: { format: true, status: true },
  });
  const formats: SocialFormat[] = ["SINGLE", "CAROUSEL"];
  const missing = formats.filter((f) => !existing.some((e) => e.format === f));
  // Post yang sudah terjadwal/tayang tidak ditimpa
  const locked = new Set(
    existing.filter((e) => e.status === "SCHEDULED" || e.status === "POSTED").map((e) => e.format),
  );
  const targets = opts.force ? formats.filter((f) => !locked.has(f)) : missing;
  if (targets.length === 0) return 0;

  const article = await loadArticle(articleId);
  if (!article) return 0;
  const kit = await getBrandKit();
  const paragraphs = tiptapParagraphs(article.contentJson);

  let copy: Copy;
  if (isAiConfigured()) {
    try {
      copy = await aiCopy(article, kit, paragraphs);
    } catch {
      copy = ruleCopy(article, kit, paragraphs);
    }
  } else {
    copy = ruleCopy(article, kit, paragraphs);
  }
  // Fallback poin bila AI/artikel terlalu pendek
  if (copy.points.length === 0) copy.points = [clipWords(article.excerpt ?? article.title, 220)];

  const imageUrl = article.cover?.url ?? article.ogImageUrl ?? null;
  const caption = copy.caption.includes("jabarnow.id")
    ? copy.caption
    : `${copy.caption}\n\n${articleLink(article.slug)}`;

  for (const format of targets) {
    const data = {
      template: kit.defaultTemplate,
      kicker: copy.kicker,
      headline: copy.headline,
      headlineAlts: copy.headlineAlts,
      highlight: copy.highlight,
      slides: slidesFor(format, copy, kit),
      caption,
      hashtags: copy.hashtags,
      imageUrl,
      generatedBy: copy.generatedBy,
      status: "PENDING_REVIEW" as const,
      reviewNote: null,
      reviewedById: null,
      reviewedAt: null,
    };
    await prisma.socialPost.upsert({
      where: { articleId_format: { articleId, format } },
      create: { articleId, format, ...data },
      update: data,
    });
  }
  return targets.length;
}

/** Dipanggil saat artikel di-approve/tayang. Best-effort: tidak pernah melempar. */
export async function autoGenerateSocial(articleId: string): Promise<void> {
  try {
    const kit = await getBrandKit();
    if (!kit.autoGenerate) return;
    await ensureSocialPackage(articleId);
  } catch (err) {
    console.error("autoGenerateSocial:", err);
  }
}
