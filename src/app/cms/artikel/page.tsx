import { connection } from "next/server";
import Link from "next/link";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export const instant = false;

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Menunggu Review",
  REVISION_REQUESTED: "Perlu Revisi",
  APPROVED: "Disetujui",
  SCHEDULED: "Terjadwal",
  PUBLISHED: "Published",
  REJECTED: "Ditolak",
  ARCHIVED: "Arsip",
};

async function loadArticles(userId: string, canEditAny: boolean) {
  try {
    return {
      ok: true,
      rows: await prisma.article.findMany({
        where: canEditAny ? {} : { authorId: userId },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          updatedAt: true,
          author: { select: { name: true } },
          category: { select: { name: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 50,
      }),
    };
  } catch {
    return { ok: false, rows: [] as never[] };
  }
}

export default async function ArtikelListPage() {
  await connection();
  const session = await requirePermission("article.edit_own");
  const canEditAny = hasPermission(session.user.role, "article.edit_any");
  const { ok, rows } = await loadArticles(session.user.id, canEditAny);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Artikel</h1>
        <Link
          href="/cms/artikel/tulis"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90"
        >
          Tulis Artikel
        </Link>
      </div>

      {!ok ? (
        <EmptyState text="Database belum tersambung. Isi DATABASE_URL lalu jalankan migrasi & seed." />
      ) : rows.length === 0 ? (
        <EmptyState text="Belum ada artikel. Mulai dengan Tulis Artikel." />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-base">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-muted text-left text-xs text-charcoal/60">
              <tr>
                <th className="px-4 py-3 font-medium">Judul</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Penulis</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Diperbarui</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <Link href={`/cms/artikel/${a.id}`} className="font-medium hover:text-brand">
                      {a.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-charcoal/60">{a.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-charcoal/60">{a.author.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-charcoal/70">
                      {STATUS_LABEL[a.status] ?? a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-charcoal/50">
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "numeric",
                      month: "short",
                      timeZone: "Asia/Jakarta",
                    }).format(a.updatedAt)}
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

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-base p-8 text-center text-sm text-charcoal/60">
      {text}
    </div>
  );
}
