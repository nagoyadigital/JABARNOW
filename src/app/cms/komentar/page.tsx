import { connection } from "next/server";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { CommentModeration } from "@/components/cms/comment-moderation";

export const instant = false;

async function loadComments() {
  try {
    return {
      ok: true,
      rows: await prisma.comment.findMany({
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        take: 100,
        select: {
          id: true,
          body: true,
          status: true,
          createdAt: true,
          user: { select: { name: true } },
          article: { select: { title: true } },
        },
      }),
    };
  } catch {
    return { ok: false, rows: [] as never[] };
  }
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

export default async function KomentarPage() {
  await connection();
  await requirePermission("comments.moderate");
  const { ok, rows } = await loadComments();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-5 text-xl font-semibold">Komentar</h1>
      {!ok ? (
        <Empty text="Database belum tersambung." />
      ) : rows.length === 0 ? (
        <Empty text="Belum ada komentar." />
      ) : (
        <ul className="space-y-3">
          {rows.map((c) => (
            <li
              key={c.id}
              className="flex items-start justify-between gap-4 rounded-[var(--radius-card)] border border-line bg-base p-4"
            >
              <div className="min-w-0">
                <p className="text-sm">{c.body}</p>
                <p className="mt-1 text-xs text-charcoal/50">
                  {c.user.name} · {c.article.title} ·{" "}
                  <span className="font-medium">{STATUS_LABEL[c.status] ?? c.status}</span>
                </p>
              </div>
              {c.status === "PENDING" && <CommentModeration id={c.id} />}
            </li>
          ))}
        </ul>
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
