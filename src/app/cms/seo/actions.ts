"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/guard";
import { writeAudit } from "@/lib/audit";

/**
 * Server actions SEO Manager (redirect 301/302). Butuh izin seo.manage.
 */

const redirectSchema = z.object({
  fromPath: z.string().min(1).startsWith("/", "Harus diawali /"),
  toPath: z.string().min(1),
  statusCode: z.coerce.number().refine((n) => n === 301 || n === 302, "301 atau 302"),
});

export type RedirectState = { ok?: boolean; error?: string };

export async function createRedirect(
  input: z.input<typeof redirectSchema>,
): Promise<RedirectState> {
  const session = await assertPermission("seo.manage");
  const parsed = redirectSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  try {
    await prisma.redirect.create({ data: parsed.data });
    await writeAudit({
      actorId: session.user.id,
      action: "seo.redirect.create",
      entity: "Redirect",
    });
    revalidatePath("/cms/seo");
    return { ok: true };
  } catch (err) {
    console.error("createRedirect:", err);
    return { error: "Gagal menyimpan (mungkin fromPath sudah ada)." };
  }
}

export async function deleteRedirect(id: string): Promise<RedirectState> {
  const session = await assertPermission("seo.manage");
  try {
    await prisma.redirect.delete({ where: { id } });
    await writeAudit({
      actorId: session.user.id,
      action: "seo.redirect.delete",
      entity: "Redirect",
      entityId: id,
    });
    revalidatePath("/cms/seo");
    return { ok: true };
  } catch {
    return { error: "Gagal menghapus." };
  }
}
