import { connection } from "next/server";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { RelativeTime } from "@/components/common/relative-time";
import { AiSourceForm, RunScoutButton, SourceRowActions } from "@/components/cms/ai-desk-controls";

export const instant = false;

/**
 * AI Desk — Sumber Berita. Kelola feed RSS/Atom/Trends yang dipantau Scout.
 * Butuh izin ai.manage.
 */
async function loadSources() {
  try {
    const since = new Date(Date.now() - 7 * 24 * 3600_000);
    const [sources, total, passed] = await Promise.all([
      prisma.newsSource.findMany({ orderBy: [{ isActive: "desc" }, { name: "asc" }] }),
      prisma.topic.groupBy({
        by: ["sourceId"],
        where: { createdAt: { gte: since } },
        _count: { _all: true },
      }),
      prisma.topic.groupBy({
        by: ["sourceId"],
        where: { createdAt: { gte: since }, status: { in: ["PASSED", "WRITING", "WRITTEN"] } },
        _count: { _all: true },
      }),
    ]);
    const totalBy = new Map(total.map((t) => [t.sourceId, t._count._all]));
    const passedBy = new Map(passed.map((t) => [t.sourceId, t._count._all]));
    return {
      ok: true,
      rows: sources.map((s) => ({
        ...s,
        week: totalBy.get(s.id) ?? 0,
        weekPassed: passedBy.get(s.id) ?? 0,
      })),
    };
  } catch {
    return { ok: false, rows: [] as never[] };
  }
}

export default async function SumberBeritaPage() {
  await connection();
  await requirePermission("ai.manage");
  const { ok, rows } = await loadSources();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal/50">AI Desk</p>
          <h1 className="text-xl font-semibold">Sumber Berita</h1>
          <p className="mt-1 text-sm text-charcoal/60">
            Feed yang dipantau Scout tiap putaran cron. Topik baru masuk ke Radar Topik.
          </p>
        </div>
        <RunScoutButton />
      </div>

      <AiSourceForm />

      <div className="rounded-[var(--radius-card)] border border-line bg-base">
        {!ok ? (
          <p className="p-5 text-sm text-charcoal/60">Database belum tersambung.</p>
        ) : rows.length === 0 ? (
          <p className="p-5 text-sm text-charcoal/60">
            Belum ada sumber. Tambahkan feed portal berita Jawa Barat di atas.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span className={s.isActive ? "" : "text-charcoal/40"}>{s.name}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-charcoal/60">
                      {s.language}
                    </span>
                    {s.kind === "TRENDS" && (
                      <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-brand">
                        Trends
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-xs text-charcoal/50">{s.url}</p>
                  {s.lastError && (
                    <p className="mt-1 text-xs text-breaking">Gagal terakhir: {s.lastError}</p>
                  )}
                </div>
                <div className="text-right text-xs text-charcoal/60">
                  <p>
                    {s.week} topik / {s.weekPassed} lolos (7 hari)
                  </p>
                  <p>
                    {s.lastCheckedAt ? (
                      <>
                        dicek <RelativeTime iso={s.lastCheckedAt.toISOString()} />
                      </>
                    ) : (
                      "belum pernah dicek"
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {s.isActive && <RunScoutButton sourceId={s.id} label="Cek" />}
                  <SourceRowActions id={s.id} isActive={s.isActive} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
