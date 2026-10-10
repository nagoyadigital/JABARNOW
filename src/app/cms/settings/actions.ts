"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/guard";
import { writeAudit } from "@/lib/audit";

/**
 * Website Settings — simpan key-value umum. Butuh izin settings.manage.
 * Branding (logo/favicon/visual tokens) hanya Super Admin (design.manage) —
 * ditangani terpisah; di sini hanya general settings.
 */

const schema = z.object({
  siteName: z.string().min(1).max(100),
  tagline: z.string().max(160).optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  gscVerification: z.string().max(200).optional(),
  commentsEnabled: z.boolean().optional(),
});

export type SettingsState = { ok?: boolean; error?: string };

export async function saveGeneralSettings(
  input: z.input<typeof schema>,
): Promise<SettingsState> {
  const session = await assertPermission("settings.manage");
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  try {
    await prisma.setting.upsert({
      where: { key: "general" },
      update: { value: parsed.data },
      create: { key: "general", value: parsed.data },
    });
    await writeAudit({
      actorId: session.user.id,
      action: "settings.update",
      entity: "Setting",
      entityId: "general",
    });
    revalidatePath("/cms/settings");
    return { ok: true };
  } catch {
    return { error: "Gagal menyimpan settings." };
  }
}
