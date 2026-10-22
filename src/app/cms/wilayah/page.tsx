import Link from "next/link";
import { connection } from "next/server";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * CMS — Wilayah. 27 kabupaten/kota Jawa Barat bersifat tetap (dari seed),
 * jadi hanya ditampilkan beserta jumlah artikelnya.
 */
export default async function WilayahCmsPage() {
  await connection();
  await requirePermission("taxonomy.manage");
  let rows: { id: string; name: string; slug: string; type: string; count: number }[] = [];
  let ok = true;
  try {
    rows = (
      await prisma.region.findMany({
        orderBy: [{ type: "desc" }, { name: "asc" }],
        select: { id: true, name: true, slug: true, type: true, _count: { select: { articles: true } } },
      })
    ).map((r) => ({ id: r.id, name: r.name, slug: r.slug, type: r.type, count: r._count.articles }));
  } catch {
    ok = false;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Wilayah</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          {rows.length} kabupaten/kota Jawa Barat. Daftar tetap; dipilih per artikel di editor.
        </p>
      </div>
      {!ok ? (
        <p className="text-sm text-charcoal/60">Database belum tersambung.</p>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-base">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs text-charcoal/60">
              <tr>
                <th className="px-4 py-2 font-medium">Nama</th>
                <th className="px-4 py-2 font-medium">Jenis</th>
                <th className="px-4 py-2 text-right font-medium">Artikel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2">
                    <Link href={`/wilayah/${r.slug}`} target="_blank" className="font-medium hover:text-brand">
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-charcoal/60">{r.type === "KOTA" ? "Kota" : "Kabupaten"}</td>
                  <td className="px-4 py-2 text-right">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
