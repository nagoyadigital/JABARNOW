"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/guard";
import { hasPermission } from "@/lib/permissions";
import { writeAudit } from "@/lib/audit";
import { slugify, withSuffix } from "@/lib/slug";
import { assertTiptapJson } from "@/lib/sanitize";
import type { ArticleStatus } from "@prisma/client";
import { autoGenerateSocial } from "@/lib/social/generate";

/**
 * Server actions editorial. Semua transisi status diverifikasi SERVER-SIDE.
 * Status: Draft → Submitted → Revision Requested/Approved → Scheduled/Published;
 * Archive & riwayat revisi. Jadwal mengikuti WIB (disimpan UTC).
 */

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || "artikel";
  let candidate = root;
  let n = 1;
  // Cari slug yang belum dipakai artikel lain
  // (loop kecil; collision jarang)
  while (true) {
    const existing = await prisma.article.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    n += 1;
    candidate = withSuffix(root, n);
  }
}

/**
 * Artikel tulisan AI Desk (punya relasi Topic) hanya boleh diputuskan oleh
 * pemegang `ai.approve` (Super Admin & Pemimpin Redaksi). Editor biasa tetap
 * bisa membaca & mengedit, tapi keputusan akhir ada di Pimred.
 */
async function assertCanDecide(
  articleId: string,
  role: Parameters<typeof hasPermission>[0],
): Promise<string | null> {
  const topic = await prisma.topic.findUnique({
    where: { articleId },
    select: { id: true },
  });
  if (topic && !hasPermission(role, "ai.approve")) {
    return "Artikel AI hanya bisa diputuskan oleh Pemimpin Redaksi atau Super Admin.";
  }
  return null;
}

const saveSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Judul wajib diisi").max(200),
  slug: z.string().optional(),
  excerpt: z.string().max(500).optional(),
  contentJson: z.any().optional(),
  categoryId: z.string().optional().nullable(),
  regionId: z.string().optional().nullable(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  focusKeyword: z.string().max(100).optional(),
});

export type SaveState = { ok?: boolean; error?: string; id?: string; slug?: string };

/** Buat / simpan draft artikel (autosave & simpan manual). */
export async function saveArticle(
  input: z.input<typeof saveSchema>,
): Promise<SaveState> {
  const session = await assertPermission("article.create");
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  const data = parsed.data;

  try {
    if (data.id) {
      // Edit: pastikan kepemilikan atau izin edit_any
      const existing = await prisma.article.findUnique({
        where: { id: data.id },
        select: { authorId: true, title: true },
      });
      if (!existing) return { error: "Artikel tidak ditemukan" };
      const isOwner = existing.authorId === session.user.id;
      if (!isOwner && !hasPermission(session.user.role, "article.edit_any")) {
        return { error: "Tidak boleh mengedit artikel milik orang lain" };
      }

      const slug =
        data.slug && data.slug.trim()
          ? await uniqueSlug(data.slug, data.id)
          : undefined;

      const updated = await prisma.article.update({
        where: { id: data.id },
        data: {
          title: data.title,
          slug,
          excerpt: data.excerpt || null,
          contentJson: assertTiptapJson(data.contentJson),
          categoryId: data.categoryId || null,
          regionId: data.regionId || null,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          focusKeyword: data.focusKeyword || null,
        },
        select: { id: true, slug: true },
      });
      await writeAudit({
        actorId: session.user.id,
        action: "article.save",
        entity: "Article",
        entityId: updated.id,
      });
      revalidatePath("/cms/artikel");
      return { ok: true, id: updated.id, slug: updated.slug };
    }

    // Create baru
    const slug = await uniqueSlug(data.slug || data.title);
    const created = await prisma.article.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || null,
        contentJson: assertTiptapJson(data.contentJson),
        categoryId: data.categoryId || null,
        regionId: data.regionId || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        focusKeyword: data.focusKeyword || null,
        status: "DRAFT",
        authorId: session.user.id,
      },
      select: { id: true, slug: true },
    });
    await writeAudit({
      actorId: session.user.id,
      action: "article.create",
      entity: "Article",
      entityId: created.id,
    });
    revalidatePath("/cms/artikel");
    return { ok: true, id: created.id, slug: created.slug };
  } catch (err) {
    console.error("saveArticle:", err);
    return { error: "Gagal menyimpan. Periksa koneksi database." };
  }
}

/** Kirim artikel untuk direview (Draft/Revision → Submitted). */
export async function submitArticle(id: string): Promise<SaveState> {
  const session = await assertPermission("article.submit");
  try {
    const article = await prisma.article.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!article) return { error: "Artikel tidak ditemukan" };
    if (
      article.authorId !== session.user.id &&
      !hasPermission(session.user.role, "article.edit_any")
    ) {
      return { error: "Tidak diizinkan" };
    }
    await prisma.$transaction([
      prisma.article.update({
        where: { id },
        data: { status: "SUBMITTED" },
      }),
      prisma.reviewAction.create({
        data: { articleId: id, actorId: session.user.id, decision: "SUBMITTED" },
      }),
    ]);
    await writeAudit({
      actorId: session.user.id,
      action: "article.submit",
      entity: "Article",
      entityId: id,
    });
    revalidatePath("/cms/review");
    revalidatePath("/cms/artikel");
    return { ok: true };
  } catch (err) {
    console.error("submitArticle:", err);
    return { error: "Gagal mengirim artikel." };
  }
}

const reviewSchema = z.object({
  id: z.string(),
  decision: z.enum(["APPROVED", "REVISION_REQUESTED", "REJECTED"]),
  comment: z.string().max(1000).optional(),
});

/** Keputusan review (approve/revisi/tolak). Butuh article.review. */
export async function reviewArticle(
  input: z.input<typeof reviewSchema>,
): Promise<SaveState> {
  const session = await assertPermission("article.review");
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { error: "Input review tidak valid" };
  const { id, decision, comment } = parsed.data;

  // Rejected & revision wajib ada alasan
  if ((decision === "REJECTED" || decision === "REVISION_REQUESTED") && !comment?.trim()) {
    return { error: "Alasan wajib diisi untuk revisi/penolakan." };
  }

  const nextStatus: ArticleStatus =
    decision === "APPROVED"
      ? "APPROVED"
      : decision === "REVISION_REQUESTED"
        ? "REVISION_REQUESTED"
        : "REJECTED";

  try {
    const blocked = await assertCanDecide(id, session.user.role);
    if (blocked) return { error: blocked };

    await prisma.$transaction([
      prisma.article.update({ where: { id }, data: { status: nextStatus } }),
      prisma.reviewAction.create({
        data: {
          articleId: id,
          actorId: session.user.id,
          decision,
          comment: comment || null,
        },
      }),
    ]);
    await writeAudit({
      actorId: session.user.id,
      action: `article.review.${decision.toLowerCase()}`,
      entity: "Article",
      entityId: id,
    });
    // Studio Sosmed: siapkan paket feed + carousel setelah artikel disetujui
    if (decision === "APPROVED") after(() => autoGenerateSocial(id));
    revalidatePath("/cms/review");
    return { ok: true };
  } catch (err) {
    console.error("reviewArticle:", err);
    return { error: "Gagal memproses review." };
  }
}

const publishSchema = z.object({
  id: z.string(),
  // ISO datetime untuk jadwal; kosong = publish sekarang
  scheduledAt: z.string().optional(),
});

/** Publish atau jadwalkan. Butuh article.publish (dan schedule bila terjadwal). */
export async function publishArticle(
  input: z.input<typeof publishSchema>,
): Promise<SaveState> {
  const session = await assertPermission("article.publish");
  const parsed = publishSchema.safeParse(input);
  if (!parsed.success) return { error: "Input publish tidak valid" };
  const { id, scheduledAt } = parsed.data;

  try {
    const blocked = await assertCanDecide(id, session.user.role);
    if (blocked) return { error: blocked };

    if (scheduledAt) {
      if (!hasPermission(session.user.role, "article.schedule")) {
        return { error: "Tidak diizinkan menjadwalkan." };
      }
      const when = new Date(scheduledAt);
      if (isNaN(when.getTime()) || when.getTime() < Date.now()) {
        return { error: "Waktu jadwal harus di masa depan." };
      }
      await prisma.article.update({
        where: { id },
        data: { status: "SCHEDULED", scheduledAt: when, publishedAt: null },
      });
      await writeAudit({
        actorId: session.user.id,
        action: "article.schedule",
        entity: "Article",
        entityId: id,
      });
    } else {
      await prisma.article.update({
        where: { id },
        data: { status: "PUBLISHED", publishedAt: new Date(), scheduledAt: null },
      });
      await writeAudit({
        actorId: session.user.id,
        action: "article.publish",
        entity: "Article",
        entityId: id,
      });
    }
    // Studio Sosmed: pastikan paket ada (idempoten bila sudah dibuat saat approve)
    after(() => autoGenerateSocial(id));
    revalidatePath("/cms/artikel");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    console.error("publishArticle:", err);
    return { error: "Gagal publish/jadwal." };
  }
}
