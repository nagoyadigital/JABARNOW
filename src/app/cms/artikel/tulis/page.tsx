import { connection } from "next/server";
import { requirePermission } from "@/lib/guard";
import { getCategoryOptions, getRegionOptions } from "@/lib/cms-data";
import { ArticleEditorForm } from "@/components/cms/article-editor-form";

export const instant = false;

/**
 * Tulis Artikel — editor baru. Butuh izin article.create.
 */
export default async function TulisArtikelPage() {
  await connection();
  await requirePermission("article.create");
  const [categories, regions] = await Promise.all([
    getCategoryOptions(),
    getRegionOptions(),
  ]);

  return (
    <div>
      <nav className="mb-1 text-xs text-charcoal/50">Konten / Tulis Artikel</nav>
      <h1 className="mb-5 text-xl font-semibold">Tulis Artikel</h1>
      <ArticleEditorForm
        categories={categories}
        regions={regions}
        initial={{
          title: "",
          slug: "",
          excerpt: "",
          categoryId: null,
          regionId: null,
          seoTitle: "",
          seoDescription: "",
          focusKeyword: "",
        }}
      />
    </div>
  );
}
