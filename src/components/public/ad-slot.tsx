/**
 * AdSlot — placeholder penempatan iklan manual (Tahap 2 visual saja).
 * Reserve height untuk cegah CLS. Nonaktif tidak menyisakan blok kosong besar
 * (10-CMS-MEDIA-AND-ADS.md). Materi iklan nyata & isolasi script di Tahap 5.
 */
export function AdSlot({
  placement,
  height = 90,
  active = false,
  className,
}: {
  placement: string;
  height?: number;
  active?: boolean;
  className?: string;
}) {
  if (!active) return null; // nonaktif: tidak render blok kosong

  return (
    <div
      className={`flex items-center justify-center rounded-[var(--radius-card)] border border-dashed border-line bg-muted ${className ?? ""}`}
      style={{ minHeight: height }}
      role="complementary"
      aria-label="Iklan"
    >
      <span className="text-[11px] uppercase tracking-wide text-charcoal/40">
        Iklan · {placement}
      </span>
    </div>
  );
}
