import { connection } from "next/server";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/lib/permissions";
import { UserRowActions } from "@/components/cms/user-row-actions";

export const instant = false;

async function loadUsers() {
  try {
    return {
      ok: true,
      rows: await prisma.user.findMany({
        where: { isStaff: true },
        orderBy: { createdAt: "asc" },
        take: 200,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          lastLoginAt: true,
        },
      }),
    };
  } catch {
    return { ok: false, rows: [] as never[] };
  }
}

export default async function UsersPage() {
  await connection();
  await requirePermission("users.manage");
  const { ok, rows } = await loadUsers();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-5 text-xl font-semibold">Users &amp; Roles</h1>
      {!ok ? (
        <Empty text="Database belum tersambung." />
      ) : rows.length === 0 ? (
        <Empty text="Belum ada user staf. Jalankan seed Super Admin." />
      ) : (
        <div className="space-y-3">
          {rows.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between gap-4 rounded-[var(--radius-card)] border border-line bg-base p-4"
            >
              <div className="min-w-0">
                <p className="font-medium">{u.name}</p>
                <p className="truncate text-xs text-charcoal/50">
                  {u.email} · {ROLE_LABELS[u.role]} ·{" "}
                  {u.status === "ACTIVE" ? "Aktif" : "Suspended"}
                </p>
              </div>
              <UserRowActions userId={u.id} role={u.role} status={u.status} />
            </div>
          ))}
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
