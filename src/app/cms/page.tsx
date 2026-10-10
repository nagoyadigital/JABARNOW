/**
 * CMS Overview — placeholder Tahap 1.
 * KPI, analytics, review queue, artikel terbaru (data nyata + empty state)
 * dibangun di Tahap 3 sesuai 07-CMS-IA-AND-OVERVIEW.md.
 * Angka ilustrasi TIDAK boleh di-hardcode di production.
 */
import { WibDate } from "@/components/common/wib-date";

export default function CmsOverviewPage() {
  const kpis = [
    "Total Artikel",
    "Published",
    "Draft",
    "Menunggu Review",
    "Scheduled",
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Selamat datang 👋</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          <WibDate />
        </p>
      </div>

      {/* KPI — empty state sampai sumber data tersambung (Tahap 3) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((label) => (
          <div
            key={label}
            className="rounded-[var(--radius-card)] border border-line bg-base p-4"
          >
            <p className="text-xs text-charcoal/50">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-charcoal/30">—</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[var(--radius-card)] border border-line bg-base p-6 text-sm text-charcoal/60">
        Dashboard penuh (KPI, analytics, review queue, artikel terbaru) akan
        tersambung ke data nyata pada Tahap 3. Angka ilustrasi tidak
        ditampilkan sebagai data aktual.
      </div>
    </div>
  );
}
