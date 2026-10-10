import { prisma } from "@/lib/prisma";

/**
 * Catat audit log. Best-effort: kegagalan log tidak boleh menggagalkan aksi utama.
 */
export async function writeAudit(input: {
  actorId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        metadata: input.metadata as object | undefined,
        ipAddress: input.ipAddress,
      },
    });
  } catch (err) {
    console.error("writeAudit gagal:", err);
  }
}
