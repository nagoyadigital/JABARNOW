"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/guard";
import { writeAudit } from "@/lib/audit";

/**
 * Ads Manager server actions. Butuh izin ads.manage.
 * Manual placement + jadwal; tanpa rotasi/targeting otomatis.
 * Script pihak ketiga dibatasi role (ads.manage) + diisolasi saat render.
 */

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(120),
  creativeType: z.enum(["IMAGE", "HTML", "SCRIPT"]),
  placement: z.enum([
    "HEADER_LEADERBOARD",
    "SIDEBAR",
    "IN_FEED",
    "IN_ARTICLE",
    "FOOTER",
    "MOBILE_AFTER_HERO",
  ]),
  imageUrl: z.string().url().optional().or(z.literal("")),
  destinationUrl: z.string().url().optional().or(z.literal("")),
  htmlPayload: z.string().max(10000).optional(),
  isActive: z.boolean().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
});

export type AdState = { ok?: boolean; error?: string };

export async function saveCampaign(
  input: z.input<typeof schema>,
): Promise<AdState> {
  const session = await assertPermission("ads.manage");
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  const d = parsed.data;

  const data = {
    name: d.name,
    creativeType: d.creativeType,
    placement: d.placement,
    imageUrl: d.imageUrl || null,
    destinationUrl: d.destinationUrl || null,
    htmlPayload: d.htmlPayload || null,
    isActive: d.isActive ?? false,
    startAt: d.startAt ? new Date(d.startAt) : null,
    endAt: d.endAt ? new Date(d.endAt) : null,
  };

  try {
    if (d.id) {
      await prisma.adCampaign.update({ where: { id: d.id }, data });
    } else {
      await prisma.adCampaign.create({ data });
    }
    await writeAudit({
      actorId: session.user.id,
      action: d.id ? "ads.update" : "ads.create",
      entity: "AdCampaign",
      entityId: d.id,
    });
    revalidatePath("/cms/ads");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    console.error("saveCampaign:", err);
    return { error: "Gagal menyimpan kampanye." };
  }
}

export async function deleteCampaign(id: string): Promise<AdState> {
  const session = await assertPermission("ads.manage");
  try {
    await prisma.adCampaign.delete({ where: { id } });
    await writeAudit({
      actorId: session.user.id,
      action: "ads.delete",
      entity: "AdCampaign",
      entityId: id,
    });
    revalidatePath("/cms/ads");
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { error: "Gagal menghapus." };
  }
}
