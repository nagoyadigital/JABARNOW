import { ChartIcon } from "@/components/common/icons";

const nf = new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 });

/**
 * PortalStats — kartu gelap statistik portal (kolom kanan beranda).
 * Angka nyata dari DB: total artikel dibaca & artikel terbit 30 hari.
 */
export function PortalStats({
  totalViews,
  published30d,
}: {
  totalViews: number;
  published30d: number;
}) {
  return (
    <section
      aria-labelledby="statistik-portal"
      className="rounded-2xl bg-charcoal p-5 text-white"
    >
      <div className="flex items-start justify-between">
        <h2
          id="statistik-portal"
          className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
          Statistik Portal
        </h2>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-brand">
          <ChartIcon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 font-heading text-4xl font-extrabold">{nf.format(totalViews)}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-white/50">
        Total artikel dibaca
      </p>
      <p className="mt-4 border-t border-white/10 pt-3 text-xs text-white/70">
        <span className="font-bold text-white">{published30d}</span> berita terbit 30 hari terakhir
      </p>
    </section>
  );
}
