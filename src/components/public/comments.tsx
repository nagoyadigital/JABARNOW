"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { postComment } from "@/app/(public)/artikel/comment-actions";

type CommentItem = {
  id: string;
  body: string;
  createdAt: string | Date;
  user: { name: string };
};

/**
 * Comments — daftar komentar disetujui + form kirim (wajib login).
 * Komentar baru masuk antrean moderasi (PENDING), tidak langsung tampil.
 */
export function Comments({
  articleId,
  initialComments,
}: {
  articleId: string;
  initialComments: CommentItem[];
}) {
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const [needLogin, setNeedLogin] = useState(false);
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      setMsg("");
      setNeedLogin(false);
      const res = await postComment({ articleId, body });
      if (res.requireLogin) {
        setNeedLogin(true);
        return;
      }
      if (res.ok) {
        setBody("");
        setMsg("Komentar terkirim dan menunggu moderasi.");
      } else {
        setMsg(res.error ?? "Gagal mengirim.");
      }
    });

  return (
    <section aria-labelledby="komentar" className="mt-10">
      <h2 id="komentar" className="mb-4 text-lg font-bold">
        Komentar{" "}
        <span className="text-charcoal/40">({initialComments.length})</span>
      </h2>

      {/* Form */}
      <div className="rounded-[var(--radius-card)] border border-line bg-base p-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Tulis komentar Anda…"
          className="w-full rounded-md border border-line bg-base px-3 py-2 text-sm outline-none focus-visible:border-brand"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-charcoal/50">
            Komentar dimoderasi sebelum tampil.
          </p>
          <button
            type="button"
            onClick={submit}
            disabled={pending || body.trim().length < 2}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
          >
            {pending ? "Mengirim…" : "Kirim"}
          </button>
        </div>
        {needLogin && (
          <p className="mt-2 text-sm text-charcoal/60">
            <Link href="/login" className="font-medium text-brand hover:underline">
              Masuk
            </Link>{" "}
            untuk berkomentar.
          </p>
        )}
        {msg && <p className="mt-2 text-sm text-brand">{msg}</p>}
      </div>

      {/* Daftar komentar */}
      {initialComments.length > 0 && (
        <ul className="mt-6 space-y-4">
          {initialComments.map((c) => (
            <li key={c.id} className="rounded-[var(--radius-card)] border border-line bg-base p-4">
              <p className="text-sm font-semibold">{c.user.name}</p>
              <p className="mt-1 text-sm text-charcoal/80">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
