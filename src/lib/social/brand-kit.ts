import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

/**
 * Brand Kit Studio Sosmed — identitas yang tampil di setiap slide.
 * Disimpan di tabel Setting (key "social.brandkit"), dengan default aman.
 */

export const TEMPLATE_KEYS = ["kotak-putih", "sorot", "breaking"] as const;
export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

export const TEMPLATE_LABELS: Record<TemplateKey, { name: string; hint: string }> = {
  "kotak-putih": { name: "Kotak Putih", hint: "Foto penuh + kotak headline putih. Lugas, cocok berita umum." },
  sorot: { name: "Sorot Gelap", hint: "Foto + gradasi gelap, headline kapital dengan kata sorotan oranye." },
  breaking: { name: "Breaking", hint: "Label breaking merah + panel gelap. Untuk berita mendesak." },
};

export const brandKitSchema = z.object({
  brandName: z.string().trim().min(1).max(40),
  handle: z.string().trim().min(2).max(40),
  ctaTitle: z.string().trim().min(2).max(80),
  ctaText: z.string().trim().max(160),
  defaultTemplate: z.enum(TEMPLATE_KEYS),
  // Jumlah slide poin pada carousel (selain cover & CTA)
  carouselPoints: z.number().int().min(1).max(5),
  // Buat paket otomatis saat artikel di-approve / tayang
  autoGenerate: z.boolean(),
  // Hashtag tetap yang selalu ditambahkan
  baseHashtags: z.array(z.string().trim().min(2).max(40)).max(5),
});

export type BrandKit = z.infer<typeof brandKitSchema>;

export const DEFAULT_BRAND_KIT: BrandKit = {
  brandName: siteConfig.name,
  handle: "@jabarnow",
  ctaTitle: "Baca selengkapnya di jabarnow.id",
  ctaText: "Ikuti @jabarnow untuk kabar terbaru dari 27 kabupaten/kota di Jawa Barat.",
  defaultTemplate: "kotak-putih",
  carouselPoints: 3,
  autoGenerate: true,
  baseHashtags: ["#JabarNow", "#BeritaJabar"],
};

const KEY = "social.brandkit";

export async function getBrandKit(): Promise<BrandKit> {
  return (await getBrandKitWithVersion()).kit;
}

/** Brand Kit + versi (waktu terakhir diubah, ms) untuk cache-busting gambar. */
export async function getBrandKitWithVersion(): Promise<{ kit: BrandKit; version: number }> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: KEY } });
    if (row?.value && typeof row.value === "object") {
      const merged = { ...DEFAULT_BRAND_KIT, ...(row.value as Partial<BrandKit>) };
      const parsed = brandKitSchema.safeParse(merged);
      if (parsed.success) return { kit: parsed.data, version: row.updatedAt.getTime() };
    }
  } catch {
    /* fallback ke default */
  }
  return { kit: DEFAULT_BRAND_KIT, version: 0 };
}

export async function saveBrandKit(kit: BrandKit): Promise<void> {
  await prisma.setting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: kit },
    update: { value: kit },
  });
}

export function isTemplateKey(v: string): v is TemplateKey {
  return (TEMPLATE_KEYS as readonly string[]).includes(v);
}
