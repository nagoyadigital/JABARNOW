"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getReactions, toggleReaction } from "@/app/(public)/artikel/reactions-actions";

const EMOJIS: { type: string; emoji: string; label: string }[] = [
  { type: "LIKE", emoji: "👍", label: "Suka" },
  { type: "LOVE", emoji: "❤️", label: "Cinta" },
  { type: "INSIGHTFUL", emoji: "💡", label: "Mencerahkan" },
  { type: "SAD", emoji: "😢", label: "Sedih" },
  { type: "ANGRY", emoji: "😠", label: "Marah" },
];

/**
 * ArticleReactions — emote reaction (wajib login).
 * Jika belum login, klik mengarahkan ke /login.
 */
export function ArticleReactions({ articleId }: { articleId: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<string | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    void getReactions(articleId).then((r) => {
      setCounts(r.counts ?? {});
      setMine(r.mine ?? null);
    });
  }, [articleId]);

  const onClick = (type: string) =>
    start(async () => {
      const r = await toggleReaction({ articleId, type: type as never });
      if (r.requireLogin) {
        setNeedLogin(true);
        return;
      }
      if (r.counts) setCounts(r.counts);
      setMine(r.mine ?? null);
    });

  return (
    <div>
      <p className="mb-2 text-sm font-semibold">Bagaimana reaksi Anda?</p>
      <div className="flex flex-wrap gap-2">
        {EMOJIS.map((e) => {
          const active = mine === e.type;
          return (
            <button
              key={e.type}
              type="button"
              disabled={pending}
              onClick={() => onClick(e.type)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-60 ${
                active
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-line hover:border-brand"
              }`}
              title={e.label}
            >
              <span aria-hidden="true">{e.emoji}</span>
              <span className="tabular-nums">{counts[e.type] ?? 0}</span>
            </button>
          );
        })}
      </div>
      {needLogin && (
        <p className="mt-2 text-sm text-charcoal/60">
          <Link href="/login" className="font-medium text-brand hover:underline">
            Masuk
          </Link>{" "}
          untuk memberi reaksi.
        </p>
      )}
    </div>
  );
}
