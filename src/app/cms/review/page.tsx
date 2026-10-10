import { connection } from "next/server";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { ReviewActions } from "@/components/cms/review-actions";

export const instant = false;

/**
 * Review & Persetujuan — antrean artikel menunggu review.
 * Butuh izin article.review. Panel tindakan sesuai izin publish/schedule.
 */
async function loadQueue() {
  try {
    return {
      ok: true,
      rows: await prisma.article.findMany({
        where: { status: { in: ["SUBMITTED", "REVISION_REQUESTED", "APPROVED"] } },
        select: {
          id: true,
          title: true,
          excerpt: true,
          status: true,
          updatedAt: true,
          author: { select: { name: true } },
          category: { select: { name: true } },
          region: { select: { name: true } },
        },
        orderBy: { updatedAt: "asc" },
        take: 50,
      }),
    };
  } catch {
    return { ok: false, rows: [] as never[] };
  }
}

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "Menunggu Review",
  REVISION_REQUESTED: "Perlu Revisi",
  APPROVED: "Disetujui",
};

export default async function ReviewPage() {
  await connection();
  const session = await requirePermission("article.review");
  const canPublish = hasPermission(session.user.role, "article.publish");
  const canSchedule = hasPermission(session.user.role, "article.schedule");
  const { ok, rows } = await loadQueue();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-5 text-xl font-semibold">Review &amp; Persetujuan</h1>

      {!ok ? (
        <Empty text="Database belum tersambung." />
      ) : rows.length === 0 ? (
        <Empty text="Tidak ada artikel dalam antrean review." />
      ) : (
        <div className="space-y-4">
          {rows.map((a) => (
            <div
              key={a.id}
              className="rounded-[var(--radius-card)] border border-line bg-base p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <span className="rounded bg-brand/10 px-2 py-0.5 text-[11px] font-semibold uppercase text-brand">
                    {STATUS_LABEL[a.status] ?? a.status}
                  </span>
                  <h2 className="mt-1 text-lg font-bold">{a.title}</h2>
                  <p className="mt-0.5 text-xs text-charcoal/50">
                    {a.author.name}
                    {a.category ? ` · ${a.category.name}` : ""}
                    {a.region ? ` · ${a.region.name}` : ""}
                  </p>
                  {a.excerpt && (
                    <p className="mt-2 text-sm text-charcoal/70">{a.excerpt}</p>
                  )}
                </div>
              </div>
              <ReviewActions
                articleId={a.id}
                canPublish={canPublish}
                canSchedule={canSchedule}
              />
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
