"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/guard";
import { writeAudit } from "@/lib/audit";

/**
 * Users & Roles actions. Butuh izin users.manage.
 * Cegah penghapusan/penurunan Super Admin terakhir & privilege escalation.
 */

const roleSchema = z.object({
  userId: z.string(),
  role: z.enum([
    "SUPER_ADMIN",
    "ADMINISTRATOR",
    "PEMIMPIN_REDAKSI",
    "EDITOR",
    "REPORTER",
    "CONTRIBUTOR",
    "ADS_MANAGER",
    "SEO_MANAGER",
  ]),
});

export type UserActionState = { ok?: boolean; error?: string };

export async function changeRole(
  input: z.input<typeof roleSchema>,
): Promise<UserActionState> {
  const session = await assertPermission("users.manage");
  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) return { error: "Input tidak valid" };
  const { userId, role } = parsed.data;

  try {
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!target) return { error: "User tidak ditemukan" };

    // Hanya Super Admin yang boleh mengangkat/menurunkan Super Admin
    if (
      (role === "SUPER_ADMIN" || target.role === "SUPER_ADMIN") &&
      session.user.role !== "SUPER_ADMIN"
    ) {
      return { error: "Hanya Super Admin yang dapat mengubah role Super Admin." };
    }

    // Cegah menurunkan Super Admin terakhir
    if (target.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
      const count = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
      if (count <= 1) {
        return { error: "Tidak bisa menurunkan Super Admin terakhir." };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role, isStaff: true },
    });
    await writeAudit({
      actorId: session.user.id,
      action: "user.role_change",
      entity: "User",
      entityId: userId,
      metadata: { role },
    });
    revalidatePath("/cms/users");
    return { ok: true };
  } catch {
    return { error: "Gagal mengubah role." };
  }
}

export async function setUserStatus(
  userId: string,
  status: "ACTIVE" | "SUSPENDED",
): Promise<UserActionState> {
  const session = await assertPermission("users.manage");
  try {
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!target) return { error: "User tidak ditemukan" };
    if (target.role === "SUPER_ADMIN" && status === "SUSPENDED") {
      const count = await prisma.user.count({
        where: { role: "SUPER_ADMIN", status: "ACTIVE" },
      });
      if (count <= 1) return { error: "Tidak bisa menonaktifkan Super Admin terakhir." };
    }
    await prisma.user.update({ where: { id: userId }, data: { status } });
    await writeAudit({
      actorId: session.user.id,
      action: "user.status_change",
      entity: "User",
      entityId: userId,
      metadata: { status },
    });
    revalidatePath("/cms/users");
    return { ok: true };
  } catch {
    return { error: "Gagal mengubah status." };
  }
}
