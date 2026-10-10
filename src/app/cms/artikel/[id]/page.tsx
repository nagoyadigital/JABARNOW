import { connection } from "next/server";
import { notFound } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { getCategoryOptions, getRegionOptions } from "@/lib/cms-data";
import { ArticleEditorForm } from "@/components/cms/article-editor-form";

export const instant = false;

/**
 * Edit artikel. Kepemilikan diverifikasi: pemilik atau article.edit_any.
 */
export default async function EditArtikelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const session = await requirePermission("article.edit_own");
  const { id } = await params;

  const article = await prisma.article.findUnique({ where: { id } }).catch(() => null);
  if (!article) notFound();

  const isOwner = article.authorId === session.user.id;
  if (!isOwner && !hasPermission(session.user.role, "article.edit_any")) {
    // Bukan pemilik & tanpa izin edit_any
    return (
      <div className="mx-auto max-w-md py-16 text-center text-sm text-charcoal/60">
        Anda tidak dapat mengedit artikel milik penulis lain.
      </div>
    );
  }

  const [categories, regions] = await Promise.all([
    getCategoryOptions(),
    getRegionOptions(),
  ]);

  return (
    <div>
      <nav className="mb-1 text-xs text-charcoal/50">Konten / Artikel / Edit</nav>
      <h1 className="mb-5 text-xl font-semibold">Edit Artikel</h1>
      <ArticleEditorForm
        categories={categories}
        regions={regions}
        initial={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt ?? "",
          contentJson: (article.contentJson as JSONContent) ?? undefined,
          categoryId: article.categoryId,
          regionId: article.regionId,
          seoTitle: article.seoTitle ?? "",
          seoDescription: article.seoDescription ?? "",
          focusKeyword: article.focusKeyword ?? "",
          status: article.status,
        }}
      />
    </div>
  );
}
