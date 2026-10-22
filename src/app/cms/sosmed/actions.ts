"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/guard";
import { writeAudit } from "@/lib/audit";
import { ensureSocialPackage } from "@/lib/social/generate";
import { brandKitSchema, saveBrandKit, TEMPLATE_KEYS } from "@/lib/social/brand-kit";
import { slideSchema, uniqueHashtags } from "@/lib/social/content";

/**
 * Server actions Studio Sosmed.
 * Edit/generate: social.manage. Approve/tolak: social.approve (Pimred & Super Admin).
 */

export type SocialActionState = { ok?: boolean; error?: string; message?: string };

function refresh(id?: string) {
  revalidatePath("/cms/sosmed");
  if (id) revalidatePath(`/cms/sosmed/${id}`);
}

/** Buat paket sosmed untuk artikel (atau tulis ulang bila force). */
export async function generateSocialPackage(
  articleId: string,
  force = false,
): Promise<SocialActionState> {
  const session = await assertPermission("social.manage");
  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { status: true },
    });
    if (!article) return { error: "Artikel tidak ditemukan." };
    if (!["APPROVED", "SCHEDULED", "PUBLISHED"].includes(article.status)) {
      return { error: "Paket sosmed hanya untuk artikel yang sudah disetujui/tayang." };
    }
    const n = await ensureSocialPackage(articleId, { force });
    await writeAudit({
      actorId: session.user.id,
      action: force ? "social.regenerate" : "social.generate",
      entity: "Article",
      entityId: articleId,
      metadata: { posts: n },
    });
    refresh();
    return {
      ok: true,
      message: n === 0 ? "Paket sudah ada." : `${n} konten dibuat. Cek di antrian.`,
    };
  } catch (err) {
    console.error("generateSocialPackage:", err);
    return { error: "Gagal membuat paket sosmed." };
  }
}

const editSchema = z.object({
  id: z.string(),
  template: z.enum(TEMPLATE_KEYS),
  kicker: z.string().trim().max(30).optional(),
  headline: z.string().trim().min(5, "Headline terlalu pendek").max(140),
  highlight: z.string().trim().max(40).optional(),
  slides: z.array(slideSchema).min(1).max(8),
  caption: z.string().trim().min(10, "Caption terlalu pendek").max(2200),
  hashtags: z.string().max(600),
  usePhoto: z.boolean(),
});

/** Simpan perubahan editor (teks, template, slide). Gambar otomatis dirender ulang. */
export async function saveSocialPost(input: z.input<typeof editSchema>): Promise<SocialActionState> {
  const session = await assertPermission("social.manage");
  const parsed = editSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  const d = parsed.data;

  try {
    const post = await prisma.socialPost.findUnique({
      where: { id: d.id },
      select: {
        status: true,
        format: true,
        article: {
          select: { ogImageUrl: true, cover: { select: { url: true } } },
        },
      },
    });
    if (!post) return { error: "Konten tidak ditemukan." };
    if (post.status === "SCHEDULED" || post.status === "POSTED") {
      return { error: "Konten yang sudah terjadwal/tayang tidak bisa diedit." };
    }

    const highlight = d.highlight && d.headline.toLowerCase().includes(d.highlight.toLowerCase()) ? d.highlight : null;
    const slides =
      post.format === "SINGLE"
        ? [{ kind: "cover" as const, title: d.headline }]
        : d.slides.map((s) => (s.kind === "cover" ? { ...s, title: d.headline } : s));

    await prisma.socialPost.update({
      where: { id: d.id },
      data: {
        template: d.template,
        kicker: d.kicker?.toUpperCase() || null,
        headline: d.headline,
        highlight,
        slides,
        caption: d.caption,
        hashtags: uniqueHashtags(d.hashtags.split(/[\s,]+/), 15),
        imageUrl: d.usePhoto ? (post.article.cover?.url ?? post.article.ogImageUrl ?? null) : null,
        // Diedit setelah disetujui → wajib dicek ulang
        ...(post.status === "APPROVED" ? { status: "PENDING_REVIEW" as const, reviewedAt: null, reviewedById: null } : {}),
      },
    });
    await writeAudit({
      actorId: session.user.id,
      action: "social.edit",
      entity: "SocialPost",
      entityId: d.id,
    });
    refresh(d.id);
    return { ok: true, message: "Tersimpan. Gambar dirender ulang." };
  } catch (err) {
    console.error("saveSocialPost:", err);
    return { error: "Gagal menyimpan." };
  }
}

/** Approve / tolak / kembalikan ke review. Keputusan hanya Pimred & Super Admin. */
export async function decideSocialPost(
  id: string,
  decision: "APPROVED" | "REJECTED" | "PENDING_REVIEW",
  note?: string,
): Promise<SocialActionState> {
  const session = await assertPermission("social.approve");
  if (decision === "REJECTED" && !note?.trim()) return { error: "Alasan penolakan wajib diisi." };
  try {
    const post = await prisma.socialPost.findUnique({ where: { id }, select: { status: true } });
    if (!post) return { error: "Konten tidak ditemukan." };
    if (post.status === "POSTED") return { error: "Konten sudah tayang." };
    await prisma.socialPost.update({
      where: { id },
      data: {
        status: decision,
        reviewNote: note?.trim() || null,
        reviewedById: decision === "PENDING_REVIEW" ? null : session.user.id,
        reviewedAt: decision === "PENDING_REVIEW" ? null : new Date(),
      },
    });
    await writeAudit({
      actorId: session.user.id,
      action: `social.${decision.toLowerCase()}`,
      entity: "SocialPost",
      entityId: id,
    });
    refresh(id);
    return { ok: true };
  } catch (err) {
    console.error("decideSocialPost:", err);
    return { error: "Gagal memproses keputusan." };
  }
}

/** Simpan Brand Kit. */
export async function updateBrandKit(input: unknown): Promise<SocialActionState> {
  const session = await assertPermission("social.manage");
  const parsed = brandKitSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  try {
    const kit = {
      ...parsed.data,
      handle: parsed.data.handle.startsWith("@") ? parsed.data.handle : `@${parsed.data.handle}`,
      baseHashtags: uniqueHashtags(parsed.data.baseHashtags, 5),
    };
    await saveBrandKit(kit);
    await writeAudit({ actorId: session.user.id, action: "social.brandkit.update", entity: "Setting" });
    revalidatePath("/cms/sosmed/brand-kit");
    return { ok: true, message: "Brand Kit tersimpan. Berlaku untuk render berikutnya." };
  } catch (err) {
    console.error("updateBrandKit:", err);
    return { error: "Gagal menyimpan Brand Kit." };
  }
}
