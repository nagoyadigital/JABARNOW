import Link from "next/link";
import { connection } from "next/server";
import type { AgentName } from "@prisma/client";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { RelativeTime } from "@/components/common/relative-time";
import { RunScoutButton } from "@/components/cms/ai-desk-controls";

export const instant = false;

/**
 * AI Desk — Ruang Redaksi AI. Ringkasan pipeline: statistik 24 jam,
 * status tiap agent, dan log putaran terakhir. Butuh izin ai.manage.
 */

const AGENTS: { name: AgentName; label: string; role: string; stage?: string }[] = [
  { name: "SCOUT", label: "Scout", role: "Pemantau sumber berita" },
  { name: "ANALIS", label: "Analis", role: "Menilai potensi & relevansi", stage: "Tahap 8" },
  { name: "COPYWRITER", label: "Copywriter", role: "Menulis artikel berita", stage: "Tahap 9" },
  { name: "DESIGNER", label: "Designer", role: "Featured image & carousel", stage: "Tahap 10" },
];

async function loadDesk() {
  const since = new Date(Date.now() - 24 * 3600_000);
  try {
    const [topics24, passed24, waitingReview, scheduled, lastRuns, recent] = await Promise.all([
      prisma.topic.count({ where: { createdAt: { gte: since } } }),
      prisma.topic.count({
        where: { createdAt: { gte: since }, status: { in: ["PASSED", "WRITING", "WRITTEN"] } },
      }),
      prisma.article.count({ where: { status: "SUBMITTED", topic: { isNot: null } } }),
      prisma.article.count({ where: { status: "SCHEDULED", topic: { isNot: null } } }),
      Promise.all(
        AGENTS.map((a) =>
          prisma.agentRun.findFirst({
            where: { agent: a.name },
            orderBy: { startedAt: "desc" },
            select: { status: true, startedAt: true, summary: true, error: true },
          }),
        ),
      ),
      prisma.agentRun.findMany({
        orderBy: { startedAt: "desc" },
        take: 15,
        select: {
          id: true,
          agent: true,
          status: true,
          startedAt: true,
          summary: true,
          error: true,
          trigger: true,
        },
      }),
    ]);
    return { ok: true as const, topics24, passed24, waitingReview, scheduled, lastRuns, recent };
  } catch {
    return { ok: false as const };
  }
}

export default async function AiDeskPage() {
  await connection();
  await requirePermission("ai.manage");
  const desk = await loadDesk();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal/50">AI Desk</p>
          <h1 className="text-xl font-semibold">Ruang Redaksi AI</h1>
          <p className="mt-1 text-sm text-charcoal/60">
            Agent menulis, Pemimpin Redaksi memutuskan. Tidak ada artikel AI yang tayang tanpa approval.
          </p>
        </div>
        <RunScoutButton />
      </div>

      {!desk.ok ? (
        <div className="rounded-[var(--radius-card)] border border-line bg-base p-8 text-center text-sm text-charcoal/60">
          Database belum tersambung.
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Topik masuk 24 jam" value={desk.topics24} href="/cms/ai-desk/radar?tab=baru" />
            <Stat label="Lolos analisis 24 jam" value={desk.passed24} href="/cms/ai-desk/radar?tab=lolos" />
            <Stat label="Menunggu keputusan" value={desk.waitingReview} href="/cms/review" accent />
            <Stat label="Terjadwal tayang" value={desk.scheduled} href="/cms/artikel" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {AGENTS.map((a, i) => {
              const last = desk.lastRuns[i];
              return (
                <div key={a.name} className="rounded-[var(--radius-card)] border border-line bg-base p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <span
                      aria-hidden
                      className={`h-2 w-2 rounded-full ${
                        a.stage
                          ? "bg-line"
                          : last?.status === "RUNNING"
                            ? "bg-brand"
                            : last?.status === "ERROR"
                              ? "bg-breaking"
                              : "bg-charcoal/50"
                      }`}
                    />
                    {a.label}
                  </p>
                  <p className="text-xs text-charcoal/50">{a.role}</p>
                  <p className="mt-3 text-xs text-charcoal/70">
                    {a.stage ? (
                      `Belum aktif (${a.stage})`
                    ) : last ? (
                      <>
                        {last.status === "RUNNING" ? "Sedang berjalan" : last.status === "ERROR" ? "Error" : "Standby"}
                        {" · "}
                        <RelativeTime iso={last.startedAt.toISOString()} />
                      </>
                    ) : (
                      "Belum pernah jalan"
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-[var(--radius-card)] border border-line bg-base">
            <h2 className="border-b border-line px-5 py-3 text-sm font-semibold">Aktivitas agent</h2>
            {desk.recent.length === 0 ? (
              <p className="p-5 text-sm text-charcoal/60">
                Belum ada aktivitas. Tambahkan{" "}
                <Link href="/cms/ai-desk/sumber" className="font-medium text-brand hover:underline">
                  sumber berita
                </Link>{" "}
                lalu jalankan Scout.
              </p>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {desk.recent.map((r) => (
                  <li key={r.id} className="flex items-start justify-between gap-4 px-5 py-3">
                    <div className="min-w-0">
                      <span
                        className={`mr-2 text-xs font-semibold ${
                          r.status === "ERROR" ? "text-breaking" : "text-brand"
                        }`}
                      >
                        {AGENTS.find((a) => a.name === r.agent)?.label ?? r.agent}
                      </span>
                      <span className="text-charcoal/80">
                        {r.status === "RUNNING" ? "Sedang berjalan…" : (r.error ?? r.summary ?? "Selesai")}
                      </span>
                      {r.trigger.startsWith("manual") && (
                        <span className="ml-2 text-[11px] text-charcoal/40">(manual)</span>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-charcoal/50">
                      <RelativeTime iso={r.startedAt.toISOString()} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-[var(--radius-card)] border bg-base p-4 transition-colors hover:border-brand ${
        accent ? "border-brand/50" : "border-line"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal/50">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent ? "text-brand" : ""}`}>{value}</p>
    </Link>
  );
}
