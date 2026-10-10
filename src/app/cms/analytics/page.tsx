import { connection } from "next/server";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/prisma";

export const instant = false;

/**
 * Analytics — internal analytics + GA4 integration-ready.
 * Label sumber data; empty state bila belum terintegrasi (bukan metrik palsu).
 */
async function loadInternal() {
  try {
    const [published, topArticles] = await Promise.all([
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        select: { title: true, viewCount: true },
        orderBy: { viewCount: "desc" },
        take: 10,
      }),
    ]);
    return { ok: true, published, topArticles };
  } catch {
    return { ok: false, published: 0, topArticles: [] as { title: string; viewCount: number }[] };
  }
}

export default async function AnalyticsPage() {
  await connection();
  await requirePermission("analytics.view");
  const { ok, published, topArticles } = await loadInternal();
  const ga4Connected = Boolean(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-xl font-semibold">Analytics</h1>

      <div className="rounded-[var(--radius-card)] border border-line bg-base p-4 text-sm">
        <span className="font-semibold">Google Analytics 4: </span>
        {ga4Connected ? (
          <span className="text-brand">Terhubung</span>
        ) : (
          <span className="text-charcoal/60">
            Belum terhubung — isi <code>NEXT_PUBLIC_GA4_MEASUREMENT_ID</code> di{" "}
            <code>.env</code>. Metrik traffic eksternal (visitors, sumber trafik)
            ditampilkan setelah terhubung; tidak ada angka dummy.
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[var(--radius-card)] border border-line bg-base p-4">
          <p className="text-xs text-charcoal/50">Artikel Published (internal)</p>
          <p className="mt-1 text-2xl font-semibold">{ok ? published : "—"}</p>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-line bg-base p-5">
        <h2 className="mb-3 text-sm font-semibold">
          Artikel Teratas{" "}
          <span className="font-normal text-charcoal/50">(views internal)</span>
        </h2>
        {!ok ? (
          <p className="text-sm text-charcoal/60">Database belum tersambung.</p>
        ) : topArticles.length === 0 ? (
          <p className="text-sm text-charcoal/60">Belum ada data views.</p>
        ) : (
          <ol className="space-y-2 text-sm">
            {topArticles.map((a, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span className="truncate">
                  <span className="mr-2 font-semibold text-brand">{i + 1}</span>
                  {a.title}
                </span>
                <span className="shrink-0 tabular-nums text-charcoal/50">
                  {a.viewCount}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
