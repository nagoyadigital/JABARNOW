/**
 * AdSlot — placeholder penempatan iklan manual.
 * - active=false & preview=false → tidak render apa pun (tanpa blok kosong besar).
 * - preview=true → tampilkan placeholder bergaya untuk MELIHAT posisi iklan
 *   (pratinjau desain; materi nyata nanti dari Ads Manager / DbAdSlot).
 * Reserve height untuk cegah CLS (10-CMS-MEDIA-AND-ADS.md).
 */
export function AdSlot({
  placement,
  label,
  size,
  height = 90,
  active = false,
  preview = false,
  className,
}: {
  placement: string;
  label?: string;
  size?: string;
  height?: number;
  active?: boolean;
  preview?: boolean;
  className?: string;
}) {
  // Tanpa aktif & tanpa preview → tidak render blok
  if (!active && !preview) return null;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 rounded-[var(--radius-card)] border border-dashed border-brand/30 bg-brand/[0.04] ${className ?? ""}`}
      style={{ minHeight: height }}
      role="complementary"
      aria-label="Area iklan"
    >
      <span className="rounded bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
        Area Iklan
      </span>
      <span className="text-[11px] text-charcoal/50">
        {label ?? placement}
        {size ? ` · ${size}` : ""}
      </span>
    </div>
  );
}
