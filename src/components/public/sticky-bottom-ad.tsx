import { connection } from "next/server";
import { AdSlot } from "@/components/public/ad-slot";
import { StickyAdFrame } from "@/components/public/sticky-ad-frame";
import { getActiveAd } from "@/lib/ads";
import { ADS_PREVIEW } from "@/lib/demo";

/**
 * StickyBottomAd — banner melayang di bawah layar, semua halaman publik.
 * Memakai placement FOOTER dari Ads Manager. Tanpa kampanye aktif: tidak
 * tampil sama sekali (kecuali mode pratinjau iklan di development).
 * Dibungkus <Suspense> di layout karena membaca DB + waktu saat request.
 */
export async function StickyBottomAd() {
  await connection();
  const ad = await getActiveAd("FOOTER");
  if (!ad && !ADS_PREVIEW) return null;

  return (
    <StickyAdFrame>
      <AdSlot
        placement="footer"
        label="Banner Melayang Bawah"
        size="970×90 / 320×50"
        height={64}
        preview
        className="lg:min-h-[90px]"
      />
    </StickyAdFrame>
  );
}
