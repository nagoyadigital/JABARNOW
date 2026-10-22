/* eslint-disable @next/next/no-img-element -- pratinjau PNG dinamis dari route render */
import Link from "next/link";
import { connection } from "next/server";
import type { Prisma, SocialPostStatus } from "@prisma/client";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { getBrandKitWithVersion } from "@/lib/social/brand-kit";
import { renderVersion, slideImagePath } from "@/lib/social/sign";
import { parseSlides } from "@/lib/social/content";
import { RelativeTime } from "@/components/common/relative-time";
import { GeneratePackageButton } from "@/components/cms/sosmed-controls";

export const instant = false;

/**
 * Studio Sosmed — Antrian. Paket feed & carousel turunan artikel.
 * Butuh izin social.manage; keputusan approve/tolak di halaman detail.
 */

const TABS: { key: string; label: string; statuses?: SocialPostStatus[] }[] = [
  { key: "review", label: "Perlu review", statuses: ["PENDING_REVIEW"] },
  { key: "disetujui", label: "Disetujui", statuses: ["APPROVED"] },
  { key: "terjadwal", label: "Terjadwal", statuses: ["SCHEDULED"] },
  { key: "tayang", label: "Sudah tayang", statuses: ["POSTED"] },
  { key: "gagal", label: "Gagal", statuses: ["FAILED"] },
  { key: "ditolak", label: "Ditolak", statuses: ["REJECTED"] },
  { key: "semua", label: "Semua" },
];

async function loadQueue(statuses?: SocialPostStatus[]) {
  const where: Prisma.SocialPostWhereInput = statuses ? { status: { in: statuses } } : {};
  try {
    const [rows, counts, pending, { version }] = await Promise.all([
      prisma.socialPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 60,
        select: {
          id: true,
          format: true,
          headline: true,
          status: true,
          slides: true,
          generatedBy: true,
          createdAt: true,
          updatedAt: true,
          article: { select: { title: true } },
        },
      }),
      prisma.socialPost.groupBy({ by: ["status"], _count: { _all: true } }),
      // Artikel siap tayang/tayang yang belum punya paket sosmed
      prisma.article.findMany({
        where: {
          status: { in: ["APPROVED", "SCHEDULED", "PUBLISHED"] },
          socialPosts: { none: {} },
        },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: { id: true, title: true, status: true, updatedAt: true },
      }),
      getBrandKitWithVersion(),
    ]);
    return {
      ok: true,
      rows,
      byStatus: new Map(counts.map((c) => [c.status, c._count._all])),
      pending,
      kitVersion: version,
    };
  } catch {
    return {
      ok: false,
      rows: [] as never[],
      byStatus: new Map<SocialPostStatus, number>(),
      pending: [] as never[],
      kitVersion: 0,
    };
  }
}

const STATUS_LABEL: Record<SocialPostStatus, string> = {
  PENDING_REVIEW: "Perlu review",
  APPROVED: "Disetujui",
  SCHEDULED: "Terjadwal",
  POSTED: "Tayang",
  FAILED: "Gagal",
  REJECTED: "Ditolak",
};

const ARTICLE_STATUS: Record<string, string> = {
  APPROVED: "Disetujui",
  SCHEDULED: "Terjadwal",
  PUBLISHED: "Tayang",
};

export default async function SosmedQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await connection();
  await requirePermission("social.manage");
  const { tab = "review" } = await searchParams;
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];
  const { ok, rows, byStatus, pending, kitVersion } = await loadQueue(active.statuses);

  const countFor = (t: (typeof TABS)[number]) =>
    t.statuses
      ? t.statuses.reduce((n, s) => n + (byStatus.get(s) ?? 0), 0)
      : [...byStatus.values()].reduce((n, v) => n + v, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal/50">Studio Sosmed</p>
          <h1 className="text-xl font-semibold">Antrian Sosmed</h1>
          <p className="mt-1 text-sm text-charcoal/60">
            Setiap artikel yang disetujui otomatis dibuatkan feed 1 slide dan carousel. Cek, edit, lalu setujui.
          </p>
        </div>
        <Link
          href="/cms/sosmed/brand-kit"
          className="rounded-md border border-line px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          Brand Kit
        </Link>
      </div>

      {ok && pending.length > 0 && (
        <div className="rounded-[var(--radius-card)] border border-brand/40 bg-base p-4">
          <h2 className="mb-2 text-sm font-semibold">Artikel belum punya paket sosmed</h2>
          <ul className="divide-y divide-line">
            {pending.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-charcoal/50">{ARTICLE_STATUS[a.status] ?? a.status}</p>
                </div>
                <GeneratePackageButton articleId={a.id} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <nav className="flex flex-wrap gap-1" aria-label="Filter status konten">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/cms/sosmed?tab=${t.key}`}
            aria-current={t.key === active.key ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              t.key === active.key ? "bg-charcoal text-white" : "text-charcoal/70 hover:bg-muted"
            }`}
          >
            {t.label} <span className="opacity-60">{countFor(t)}</span>
          </Link>
        ))}
      </nav>

      {!ok ? (
        <Empty text="Database belum tersambung." />
      ) : rows.length === 0 ? (
        <Empty text="Belum ada konten di sini." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((p) => {
            const slides = parseSlides(p.slides);
            return (
              <Link
                key={p.id}
                href={`/cms/sosmed/${p.id}`}
                className="group overflow-hidden rounded-[var(--radius-card)] border border-line bg-base transition-colors hover:border-brand"
              >
                <div className="relative aspect-[4/5] bg-muted">
                  <img
                    src={slideImagePath(p.id, 0, renderVersion(p.updatedAt, kitVersion))}
                    alt={p.headline}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded bg-charcoal/80 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                    {p.format === "SINGLE" ? "Feed" : `Carousel ${slides.length}`}
                  </span>
                  {p.generatedBy.startsWith("ai") && (
                    <span className="absolute right-2 top-2 rounded bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                      AI
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-semibold group-hover:text-brand">{p.headline}</p>
                  <p className="mt-1 truncate text-[11px] text-charcoal/50">{p.article.title}</p>
                  <p className="mt-1 text-[11px] text-charcoal/50">
                    {STATUS_LABEL[p.status]} · <RelativeTime iso={p.createdAt.toISOString()} />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-base p-8 text-center text-sm text-charcoal/60">
      {text}
    </div>
  );
}
