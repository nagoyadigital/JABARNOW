"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/guard";
import { writeAudit } from "@/lib/audit";
import { isFetchableUrl } from "@/lib/ai/normalize";
import { runScout, testFeed } from "@/lib/ai/scout";
import { isAgentBusy } from "@/lib/ai/agent-run";

/**
 * Server actions AI Desk. Semua butuh izin ai.manage (diverifikasi server-side).
 */

export type ActionState = { ok?: boolean; error?: string; message?: string };

function refresh() {
  revalidatePath("/cms/ai-desk");
  revalidatePath("/cms/ai-desk/sumber");
  revalidatePath("/cms/ai-desk/radar");
}

const sourceSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  url: z
    .string()
    .trim()
    .url("URL tidak valid")
    .max(500)
    .refine(isFetchableUrl, "URL harus http/https publik"),
  language: z.enum(["id", "en"]),
  kind: z.enum(["RSS", "TRENDS"]),
});

/** Tambah sumber berita baru. */
export async function addSource(input: z.input<typeof sourceSchema>): Promise<ActionState> {
  const session = await assertPermission("ai.manage");
  const parsed = sourceSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };

  try {
    const exists = await prisma.newsSource.findUnique({
      where: { url: parsed.data.url },
      select: { id: true },
    });
    if (exists) return { error: "URL feed ini sudah terdaftar." };

    const created = await prisma.newsSource.create({ data: parsed.data, select: { id: true } });
    await writeAudit({
      actorId: session.user.id,
      action: "ai.source.create",
      entity: "NewsSource",
      entityId: created.id,
      metadata: { url: parsed.data.url },
    });
    refresh();
    return { ok: true, message: "Sumber ditambahkan. Scout mengambilnya di putaran berikutnya." };
  } catch (err) {
    console.error("addSource:", err);
    return { error: "Gagal menyimpan sumber." };
  }
}

/** Aktif/nonaktifkan sumber. */
export async function toggleSource(id: string, isActive: boolean): Promise<ActionState> {
  const session = await assertPermission("ai.manage");
  try {
    await prisma.newsSource.update({ where: { id }, data: { isActive } });
    await writeAudit({
      actorId: session.user.id,
      action: isActive ? "ai.source.enable" : "ai.source.disable",
      entity: "NewsSource",
      entityId: id,
    });
    refresh();
    return { ok: true };
  } catch {
    return { error: "Gagal mengubah status sumber." };
  }
}

/** Hapus sumber beserta topik yang belum menjadi artikel. */
export async function deleteSource(id: string): Promise<ActionState> {
  const session = await assertPermission("ai.manage");
  try {
    const written = await prisma.topic.count({ where: { sourceId: id, articleId: { not: null } } });
    if (written > 0) {
      return { error: "Sumber ini sudah menghasilkan artikel. Nonaktifkan saja, jangan dihapus." };
    }
    await prisma.newsSource.delete({ where: { id } });
    await writeAudit({
      actorId: session.user.id,
      action: "ai.source.delete",
      entity: "NewsSource",
      entityId: id,
    });
    refresh();
    return { ok: true };
  } catch {
    return { error: "Gagal menghapus sumber." };
  }
}

/** Uji URL feed sebelum disimpan (tidak menyimpan apa pun). */
export async function checkFeed(url: string): Promise<ActionState> {
  await assertPermission("ai.manage");
  if (!isFetchableUrl(url)) return { error: "URL harus http/https publik." };
  const res = await testFeed(url);
  if (!res.ok) return { error: `Feed tidak bisa dibaca: ${res.error}` };
  if (res.count === 0) return { error: "Feed terbaca, tapi tidak ada item berita." };
  return {
    ok: true,
    message: `${res.count} item terbaca. Contoh: ${res.sample.join(" · ")}`,
  };
}

/** Tombol "Cari topik sekarang": jalankan Scout di luar jadwal cron. */
export async function runScoutNow(sourceId?: string): Promise<ActionState> {
  const session = await assertPermission("ai.manage");
  try {
    if (await isAgentBusy("SCOUT")) return { error: "Scout sedang berjalan. Coba lagi sebentar." };
    const result = await runScout({
      trigger: `manual:${session.user.id}`,
      sourceIds: sourceId ? [sourceId] : undefined,
    });
    refresh();
    return {
      ok: true,
      message: `${result.created} topik baru dari ${result.sources.length} sumber${
        result.failed ? ` (${result.failed} sumber gagal, cek kolom error)` : ""
      }.`,
    };
  } catch (err) {
    console.error("runScoutNow:", err);
    return { error: "Scout gagal dijalankan." };
  }
}

/** Abaikan topik (tidak akan dinilai/ditulis) atau kembalikan ke antrean. */
export async function setTopicSkipped(id: string, skipped: boolean): Promise<ActionState> {
  const session = await assertPermission("ai.manage");
  try {
    const topic = await prisma.topic.findUnique({ where: { id }, select: { status: true } });
    if (!topic) return { error: "Topik tidak ditemukan." };
    if (topic.status === "WRITING" || topic.status === "WRITTEN") {
      return { error: "Topik sudah diproses Copywriter." };
    }
    await prisma.topic.update({ where: { id }, data: { status: skipped ? "SKIPPED" : "NEW" } });
    await writeAudit({
      actorId: session.user.id,
      action: skipped ? "ai.topic.skip" : "ai.topic.restore",
      entity: "Topic",
      entityId: id,
    });
    refresh();
    return { ok: true };
  } catch {
    return { error: "Gagal memperbarui topik." };
  }
}
