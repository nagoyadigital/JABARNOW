"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertPermission } from "@/lib/guard";
import { writeAudit } from "@/lib/audit";

/**
 * Moderasi komentar. Butuh izin comments.moderate.
 */
export async function moderateComment(
  id: string,
  status: "APPROVED" | "REJECTED",
): Promise<{ ok?: boolean; error?: string }> {
  const session = await assertPermission("comments.moderate");
  try {
    await prisma.comment.update({ where: { id }, data: { status } });
    await writeAudit({
      actorId: session.user.id,
      action: `comment.${status.toLowerCase()}`,
      entity: "Comment",
      entityId: id,
    });
    revalidatePath("/cms/komentar");
    return { ok: true };
  } catch {
    return { error: "Gagal memproses komentar." };
  }
}
