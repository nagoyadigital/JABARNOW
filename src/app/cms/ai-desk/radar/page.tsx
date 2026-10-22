import Link from "next/link";
import { connection } from "next/server";
import type { Prisma, TopicStatus } from "@prisma/client";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { RelativeTime } from "@/components/common/relative-time";
import { RunScoutButton, TopicSkipButton } from "@/components/cms/ai-desk-controls";

export const instant = false;

/**
 * AI Desk — Radar Topik. Semua topik mentah hasil Scout + skor Analis (Tahap 8).
 * Butuh izin ai.manage.
 */

const TABS: { key: string; label: string; statuses?: TopicStatus[] }[] = [
  { key: "semua", label: "Semua" },
  { key: "baru", label: "Baru", statuses: ["NEW"] },
  { key: "lolos", label: "Lolos", statuses: ["PASSED", "WRITING"] },
  { key: "ditulis", label: "Jadi artikel", statuses: ["WRITTEN"] },
  { key: "gagal", label: "Tidak lolos", statuses: ["FAILED"] },
  { key: "diabaikan", label: "Diabaikan", statuses: ["SKIPPED"] },
];

const STATUS_LABEL: Record<TopicStatus, string> = {
  NEW: "Baru",
  PASSED: "Lolos",
  FAILED: "Tidak lolos",
  WRITING: "Sedang ditulis",
  WRITTEN: "Jadi artikel",
  SKIPPED: "Diabaikan",
};

async function loadTopics(statuses?: TopicStatus[], q?: string) {
  const where: Prisma.TopicWhereInput = {
    ...(statuses ? { status: { in: statuses } } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
  };
  try {
    const [rows, counts] = await Promise.all([
      prisma.topic.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          title: true,
          url: true,
          summary: true,
          imageUrl: true,
          publishedAt: true,
          createdAt: true,
          score: true,
          scoreReason: true,
          sensitive: true,
          status: true,
          source: { select: { name: true } },
        },
      }),
      prisma.topic.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);
    const byStatus = new Map(counts.map((c) => [c.status, c._count._all]));
    return { ok: true, rows, byStatus };
  } catch {
    return { ok: false, rows: [] as never[], byStatus: new Map<TopicStatus, number>() };
  }
}

export default async function RadarPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  await connection();
  await requirePermission("ai.manage");
  const { tab = "semua", q } = await searchParams;
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];
  const query = q?.trim().slice(0, 100) || undefined;
  const { ok, rows, byStatus } = await loadTopics(active.statuses, query);

  const countFor = (t: (typeof TABS)[number]) =>
    t.statuses
      ? t.statuses.reduce((n, s) => n + (byStatus.get(s) ?? 0), 0)
      : [...byStatus.values()].reduce((n, v) => n + v, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal/50">AI Desk</p>
          <h1 className="text-xl font-semibold">Radar Topik</h1>
          <p className="mt-1 text-sm text-charcoal/60">
            Semua topik yang ditemukan Scout. Penilaian Analis dan penulisan otomatis aktif di tahap berikutnya.
          </p>
        </div>
        <RunScoutButton />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1" aria-label="Filter status topik">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/cms/ai-desk/radar?tab=${t.key}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              aria-current={t.key === active.key ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                t.key === active.key ? "bg-charcoal text-white" : "text-charcoal/70 hover:bg-muted"
              }`}
            >
              {t.label} <span className="opacity-60">{countFor(t)}</span>
            </Link>
          ))}
        </nav>
        <form action="/cms/ai-desk/radar" className="flex gap-2">
          <input type="hidden" name="tab" value={active.key} />
          <input
            name="q"
            defaultValue={query}
            placeholder="Cari judul…"
            aria-label="Cari judul topik"
            className="w-48 rounded-md border border-line bg-base px-3 py-1.5 text-sm outline-none focus-visible:border-brand"
          />
        </form>
      </div>

      <div className="rounded-[var(--radius-card)] border border-line bg-base">
        {!ok ? (
          <p className="p-5 text-sm text-charcoal/60">Database belum tersambung.</p>
        ) : rows.length === 0 ? (
          <p className="p-5 text-sm text-charcoal/60">
            Belum ada topik di sini. Tambahkan sumber berita lalu klik &quot;Cari topik sekarang&quot;.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((t) => (
              <li key={t.id} className="flex items-start gap-4 p-4">
                <div className="w-12 shrink-0 text-center">
                  {t.score != null ? (
                    <span
                      className={`text-lg font-bold ${t.score >= 70 ? "text-brand" : "text-charcoal/40"}`}
                    >
                      {t.score}
                    </span>
                  ) : (
                    <span className="text-xs text-charcoal/30">—</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold hover:text-brand"
                  >
                    {t.title}
                  </a>
                  {t.summary && (
                    <p className="mt-1 line-clamp-2 text-xs text-charcoal/60">{t.summary}</p>
                  )}
                  {t.scoreReason && (
                    <p className="mt-1 text-xs italic text-charcoal/60">Analis: {t.scoreReason}</p>
                  )}
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-charcoal/50">
                    <span className="font-medium text-charcoal/70">{t.source.name}</span>
                    <span>·</span>
                    <RelativeTime iso={(t.publishedAt ?? t.createdAt).toISOString()} />
                    <span>·</span>
                    <span>{STATUS_LABEL[t.status]}</span>
                    {t.imageUrl && (
                      <>
                        <span>·</span>
                        <span>ada gambar</span>
                      </>
                    )}
                    {t.sensitive && (
                      <span className="rounded bg-breaking/10 px-1.5 py-0.5 font-semibold text-breaking">
                        Sensitif
                      </span>
                    )}
                  </p>
                </div>
                {t.status !== "WRITING" && t.status !== "WRITTEN" && (
                  <TopicSkipButton id={t.id} skipped={t.status === "SKIPPED"} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {rows.length === 100 && (
        <p className="text-center text-xs text-charcoal/50">Menampilkan 100 topik terbaru.</p>
      )}
    </div>
  );
}
