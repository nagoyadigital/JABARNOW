"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewArticle, publishArticle } from "@/app/cms/artikel/actions";

/**
 * ReviewActions — panel keputusan review (approve/revisi/tolak) + publish/jadwal.
 * Tombol yang tampil mengikuti izin (dilewatkan dari server).
 */
export function ReviewActions({
  articleId,
  canPublish,
  canSchedule,
}: {
  articleId: string;
  canPublish: boolean;
  canSchedule: boolean;
}) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [schedule, setSchedule] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ ok?: boolean; error?: string }>) =>
    start(async () => {
      setMsg("");
      const res = await fn();
      if (res.ok) {
        setMsg("Berhasil.");
        router.refresh();
      } else {
        setMsg(res.error ?? "Gagal.");
      }
    });

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-charcoal/60">
          Komentar editor (wajib untuk revisi/penolakan)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-line bg-base px-3 py-2 text-sm outline-none focus-visible:border-brand"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => reviewArticle({ id: articleId, decision: "APPROVED", comment }))}
          className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
        >
          Setujui
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => reviewArticle({ id: articleId, decision: "REVISION_REQUESTED", comment }))}
          className="rounded-md border border-line px-3 py-2 text-sm font-medium hover:border-brand hover:text-brand disabled:opacity-60"
        >
          Minta Revisi
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => reviewArticle({ id: articleId, decision: "REJECTED", comment }))}
          className="rounded-md border border-breaking/40 px-3 py-2 text-sm font-medium text-breaking hover:bg-breaking/10 disabled:opacity-60"
        >
          Tolak
        </button>
      </div>

      {(canPublish || canSchedule) && (
        <div className="rounded-md border border-line bg-muted p-3">
          <p className="mb-2 text-xs font-semibold text-charcoal/70">Publikasi</p>
          <div className="flex flex-wrap items-center gap-2">
            {canPublish && (
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => publishArticle({ id: articleId }))}
                className="rounded-md bg-charcoal px-3 py-2 text-sm font-semibold text-white hover:bg-charcoal/90 disabled:opacity-60"
              >
                Publish Sekarang
              </button>
            )}
            {canSchedule && (
              <>
                <input
                  type="datetime-local"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="rounded-md border border-line bg-base px-2 py-1.5 text-sm outline-none focus-visible:border-brand"
                />
                <button
                  type="button"
                  disabled={pending || !schedule}
                  onClick={() =>
                    run(() =>
                      publishArticle({
                        id: articleId,
                        scheduledAt: new Date(schedule).toISOString(),
                      }),
                    )
                  }
                  className="rounded-md border border-line px-3 py-2 text-sm font-medium hover:border-brand hover:text-brand disabled:opacity-60"
                >
                  Jadwalkan (WIB)
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {msg && <p className="text-xs text-charcoal/60">{msg}</p>}
    </div>
  );
}
