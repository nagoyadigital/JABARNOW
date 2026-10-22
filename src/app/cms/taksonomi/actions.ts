"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/guard";
import { writeAudit } from "@/lib/audit";
import { slugify } from "@/lib/slug";

/**
 * Kelola taksonomi redaksi: Kategori & Tag. Butuh izin taxonomy.manage.
 * Wilayah (27 kab/kota) bersifat tetap → hanya ditampilkan, tidak diedit.
 */

export type TaxonomyKind = "category" | "tag";
export type TaxonomyState = { ok?: boolean; error?: string };

const nameSchema = z.string().trim().min(2, "Nama minimal 2 karakter").max(60);

function refresh(kind: TaxonomyKind) {
  revalidatePath(kind === "category" ? "/cms/kategori" : "/cms/tag");
}

export async function createTaxonomy(kind: TaxonomyKind, rawName: string): Promise<TaxonomyState> {
  const session = await assertPermission("taxonomy.manage");
  const parsed = nameSchema.safeParse(rawName);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const name = parsed.data;
  const slug = slugify(name);
  if (!slug) return { error: "Nama tidak valid." };
  try {
    const exists =
      kind === "category"
        ? await prisma.category.findUnique({ where: { slug }, select: { id: true } })
        : await prisma.tag.findUnique({ where: { slug }, select: { id: true } });
    if (exists) return { error: "Sudah ada dengan nama/slug yang sama." };
    const created =
      kind === "category"
        ? await prisma.category.create({ data: { name, slug }, select: { id: true } })
        : await prisma.tag.create({ data: { name, slug }, select: { id: true } });
    await writeAudit({ actorId: session.user.id, action: `${kind}.create`, entity: kind, entityId: created.id });
    refresh(kind);
    return { ok: true };
  } catch {
    return { error: "Gagal menyimpan." };
  }
}

/** Ganti nama tampil. Slug (URL) sengaja TIDAK diubah agar tautan & SEO tidak rusak. */
export async function renameTaxonomy(kind: TaxonomyKind, id: string, rawName: string): Promise<TaxonomyState> {
  const session = await assertPermission("taxonomy.manage");
  const parsed = nameSchema.safeParse(rawName);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    if (kind === "category") await prisma.category.update({ where: { id }, data: { name: parsed.data } });
    else await prisma.tag.update({ where: { id }, data: { name: parsed.data } });
    await writeAudit({ actorId: session.user.id, action: `${kind}.rename`, entity: kind, entityId: id });
    refresh(kind);
    return { ok: true };
  } catch {
    return { error: "Gagal mengganti nama." };
  }
}

/** Hapus hanya bila tidak dipakai artikel (cegah artikel kehilangan kategori/tag). */
export async function deleteTaxonomy(kind: TaxonomyKind, id: string): Promise<TaxonomyState> {
  const session = await assertPermission("taxonomy.manage");
  try {
    const used =
      kind === "category"
        ? await prisma.article.count({ where: { categoryId: id } })
        : await prisma.articleTag.count({ where: { tagId: id } });
    if (used > 0) return { error: `Masih dipakai ${used} artikel. Pindahkan dulu artikelnya.` };
    if (kind === "category") await prisma.category.delete({ where: { id } });
    else await prisma.tag.delete({ where: { id } });
    await writeAudit({ actorId: session.user.id, action: `${kind}.delete`, entity: kind, entityId: id });
    refresh(kind);
    return { ok: true };
  } catch {
    return { error: "Gagal menghapus." };
  }
}
