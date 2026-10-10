import { prisma } from "@/lib/prisma";
import type { AdPlacementSlot } from "@prisma/client";

/**
 * Ambil satu kampanye aktif untuk sebuah placement (dalam rentang jadwal WIB).
 * Tanpa rotasi otomatis: ambil yang terbaru aktif. Fallback null bila kosong/DB mati.
 */
export async function getActiveAd(placement: AdPlacementSlot) {
  const now = new Date();
  try {
    return await prisma.adCampaign.findFirst({
      where: {
        placement,
        isActive: true,
        AND: [
          { OR: [{ startAt: null }, { startAt: { lte: now } }] },
          { OR: [{ endAt: null }, { endAt: { gte: now } }] },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return null;
  }
}
