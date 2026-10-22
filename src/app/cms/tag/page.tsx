import { connection } from "next/server";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { TaxonomyManager } from "@/components/cms/taxonomy-manager";

export const instant = false;

/** CMS — Tag. Butuh izin taxonomy.manage. */
export default async function TagCmsPage() {
  await connection();
  await requirePermission("taxonomy.manage");
  let rows: { id: string; name: string; slug: string; count: number }[] = [];
  let ok = true;
  try {
    rows = (
      await prisma.tag.findMany({
        orderBy: { articles: { _count: "desc" } },
        take: 500,
        select: { id: true, name: true, slug: true, _count: { select: { articles: true } } },
      })
    ).map((t) => ({ id: t.id, name: t.name, slug: t.slug, count: t._count.articles }));
  } catch {
    ok = false;
  }
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <h1 className="text-xl font-semibold">Tag</h1>
      {ok ? (
        <TaxonomyManager kind="tag" rows={rows} />
      ) : (
        <p className="text-sm text-charcoal/60">Database belum tersambung.</p>
      )}
    </div>
  );
}
