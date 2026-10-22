import type { AdPlacementSlot } from "@prisma/client";
import { DbAdSlot } from "@/components/public/db-ad-slot";
import { ADS_PREVIEW } from "@/lib/demo";

/**
 * AdSlot — titik penempatan iklan manual.
 * 1. Bila ada kampanye AKTIF dari Ads Manager untuk placement ini → tampilkan
 *    materinya (DbAdSlot).
 * 2. Bila tidak ada → kotak pratinjau "Area Iklan" HANYA saat `preview` dan
 *    mode pratinjau iklan aktif (development / NEXT_PUBLIC_ADS_PREVIEW=1).
 *    Di produksi tanpa kampanye: tidak merender apa pun.
 * Reserve height untuk cegah CLS (10-CMS-MEDIA-AND-ADS.md).
 */
const PLACEMENT_SLOT: Record<string, AdPlacementSlot> = {
  "header-leaderboard": "HEADER_LEADERBOARD",
  sidebar: "SIDEBAR",
  "in-feed": "IN_FEED",
  "in-article": "IN_ARTICLE",
  footer: "FOOTER",
  "mobile-after-hero": "MOBILE_AFTER_HERO",
};

export async function AdSlot(props: {
  placement: string;
  label?: string;
  size?: string;
  height?: number;
  active?: boolean;
  preview?: boolean;
  className?: string;
}) {
  const slot = PLACEMENT_SLOT[props.placement];
  const fallback =
    props.active || (props.preview && ADS_PREVIEW) ? <AdPlaceholder {...props} /> : null;
  if (!slot) return fallback;
  return (
    <DbAdSlot
      placement={slot}
      minHeight={props.height}
      className={props.className}
      fallback={fallback}
    />
  );
}

/** Kotak pratinjau posisi iklan (bukan materi iklan). */
function AdPlaceholder({
  placement,
  label,
  size,
  height = 90,
  className,
}: {
  placement: string;
  label?: string;
  size?: string;
  height?: number;
  className?: string;
}) {
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
