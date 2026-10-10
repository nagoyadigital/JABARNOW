import { connection } from "next/server";
import { requireStaff } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { WibDate } from "@/components/common/wib-date";
import { ROLE_LABELS } from "@/lib/permissions";

export const instant = false;

/**
 * CMS Overview — KPI dari data nyata (dengan empty state bila DB belum tersedia).
 * Angka ilustrasi TIDAK di-hardcode. Semua angka dihitung dari database.
 */

type Kpi = { label: string; value: number | null };

async function loadKpis(): Promise<{ kpis: Kpi[]; dbOk: boolean }> {
  try {
    const [total, published, draft, review, scheduled] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.article.count({ where: { status: "DRAFT" } }),
      prisma.article.count({ where: { status: "SUBMITTED" } }),
      prisma.article.count({ where: { status: "SCHEDULED" } }),
    ]);
    return {
      dbOk: true,
      kpis: [
        { label: "Total Artikel", value: total },
        { label: "Published", value: published },
        { label: "Draft", value: draft },
        { label: "Menunggu Review", value: review },
        { label: "Scheduled", value: scheduled },
      ],
    };
  } catch {
    // DB belum tersambung — tampil empty state, bukan angka palsu
    return {
      dbOk: false,
      kpis: [
        { label: "Total Artikel", value: null },
        { label: "Published", value: null },
        { label: "Draft", value: null },
        { label: "Menunggu Review", value: null },
        { label: "Scheduled", value: null },
      ],
    };
  }
}

export default async function CmsOverviewPage() {
  await connection();
  const session = await requireStaff();
  const { kpis, dbOk } = await loadKpis();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">
          Selamat datang, {session.user.name} 👋
        </h1>
        <p className="mt-1 text-sm text-charcoal/60">
          {ROLE_LABELS[session.user.role]} · <WibDate />
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-[var(--radius-card)] border border-line bg-base p-4"
          >
            <p className="text-xs text-charcoal/50">{kpi.label}</p>
            <p className="mt-2 text-2xl font-semibold">
              {kpi.value === null ? (
                <span className="text-charcoal/30">—</span>
              ) : (
                kpi.value
              )}
            </p>
          </div>
        ))}
      </div>

      {!dbOk && (
        <div className="mt-6 rounded-[var(--radius-card)] border border-line bg-base p-6 text-sm text-charcoal/60">
          Database belum tersambung. Isi <code>DATABASE_URL</code> di{" "}
          <code>.env</code> lalu jalankan <code>npm run db:migrate</code> dan{" "}
          <code>npm run db:seed</code> untuk mengaktifkan data nyata. Sampai itu,
          KPI menampilkan empty state (bukan angka ilustrasi).
        </div>
      )}
    </div>
  );
}
