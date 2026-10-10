import { connection } from "next/server";
import { requireStaff } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export const instant = false;

/**
 * Audit Log — hanya role dengan users.manage atau settings.manage.
 */
async function loadLogs() {
  try {
    return {
      ok: true,
      rows: await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          createdAt: true,
          actor: { select: { name: true } },
        },
      }),
    };
  } catch {
    return { ok: false, rows: [] as never[] };
  }
}

export default async function AuditPage() {
  await connection();
  const session = await requireStaff();
  const allowed =
    hasPermission(session.user.role, "users.manage") ||
    hasPermission(session.user.role, "settings.manage");
  if (!allowed) {
    return (
      <div className="mx-auto max-w-md py-16 text-center text-sm text-charcoal/60">
        Anda tidak memiliki izin melihat audit log.
      </div>
    );
  }

  const { ok, rows } = await loadLogs();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-5 text-xl font-semibold">Audit Log</h1>
      {!ok ? (
        <Empty text="Database belum tersambung." />
      ) : rows.length === 0 ? (
        <Empty text="Belum ada aktivitas tercatat." />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-base">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-muted text-left text-xs text-charcoal/60">
              <tr>
                <th className="px-4 py-3 font-medium">Waktu (WIB)</th>
                <th className="px-4 py-3 font-medium">Aktor</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
                <th className="px-4 py-3 font-medium">Entitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-2 text-charcoal/60">
                    {new Intl.DateTimeFormat("id-ID", {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: "Asia/Jakarta",
                    }).format(l.createdAt)}
                  </td>
                  <td className="px-4 py-2">{l.actor?.name ?? "Sistem"}</td>
                  <td className="px-4 py-2">
                    <code className="text-xs">{l.action}</code>
                  </td>
                  <td className="px-4 py-2 text-charcoal/50">
                    {l.entity ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-base p-8 text-center text-sm text-charcoal/60">
      {text}
    </div>
  );
}
