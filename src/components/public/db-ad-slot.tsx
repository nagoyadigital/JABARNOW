import Link from "next/link";
import type { AdPlacementSlot } from "@prisma/client";
import { getActiveAd } from "@/lib/ads";
import { sanitizeHtml } from "@/lib/sanitize";

/**
 * DbAdSlot — render kampanye aktif dari DB untuk sebuah placement.
 * - IMAGE: banner + tautan tujuan
 * - HTML: disanitasi sebelum render
 * - SCRIPT: diisolasi dalam iframe sandbox (bukan inject langsung ke DOM CMS/situs)
 * Nonaktif/kosong → tidak merender blok (hindari area kosong besar).
 * Reserve height untuk cegah CLS.
 */
export async function DbAdSlot({
  placement,
  minHeight = 90,
  className,
  fallback = null,
}: {
  placement: AdPlacementSlot;
  minHeight?: number;
  className?: string;
  /** Ditampilkan bila tidak ada kampanye aktif (mis. pratinjau posisi). */
  fallback?: React.ReactNode;
}) {
  const ad = await getActiveAd(placement);
  if (!ad) return fallback;

  const wrap = `overflow-hidden rounded-[var(--radius-card)] ${className ?? ""}`;

  if (ad.creativeType === "IMAGE" && ad.imageUrl) {
    const img = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={ad.imageUrl}
        alt={ad.name}
        className="h-auto w-full object-contain"
        style={{ minHeight }}
      />
    );
    return (
      <div className={wrap} role="complementary" aria-label="Iklan">
        {ad.destinationUrl ? (
          <Link href={ad.destinationUrl} target="_blank" rel="nofollow sponsored noopener">
            {img}
          </Link>
        ) : (
          img
        )}
      </div>
    );
  }

  if (ad.creativeType === "HTML" && ad.htmlPayload) {
    return (
      <div
        className={wrap}
        role="complementary"
        aria-label="Iklan"
        style={{ minHeight }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(ad.htmlPayload) }}
      />
    );
  }

  if (ad.creativeType === "SCRIPT" && ad.htmlPayload) {
    // Script pihak ketiga diisolasi dalam iframe sandbox (tanpa same-origin).
    const doc = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0">${ad.htmlPayload}</body></html>`;
    return (
      <div className={wrap} role="complementary" aria-label="Iklan">
        <iframe
          title={`Iklan: ${ad.name}`}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          srcDoc={doc}
          className="w-full border-0"
          style={{ minHeight }}
        />
      </div>
    );
  }

  return fallback;
}
