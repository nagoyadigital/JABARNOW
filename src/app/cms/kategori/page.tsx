import { connection } from "next/server";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { TaxonomyManager } from "@/components/cms/taxonomy-manager";

export const instant = false;

/** CMS — Kategori. Butuh izin taxonomy.manage. */
export default async function KategoriCmsPage() {
  await connection();
  await requirePermission("taxonomy.manage");
  let rows: { id: string; name: string; slug: string; count: number }[] = [];
  let ok = true;
  try {
    rows = (
      await prisma.category.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true, _count: { select: { articles: true } } },
      })
    ).map((c) => ({ id: c.id, name: c.name, slug: c.slug, count: c._count.articles }));
  } catch {
    ok = false;
  }
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <h1 className="text-xl font-semibold">Kategori</h1>
      {ok ? (
        <TaxonomyManager kind="category" rows={rows} />
      ) : (
        <p className="text-sm text-charcoal/60">Database belum tersambung.</p>
      )}
    </div>
  );
}
