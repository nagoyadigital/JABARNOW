"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { moderateComment } from "@/app/cms/komentar/actions";

export function CommentModeration({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const act = (status: "APPROVED" | "REJECTED") =>
    start(async () => {
      await moderateComment(id, status);
      router.refresh();
    });

  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => act("APPROVED")}
        className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
      >
        Setujui
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => act("REJECTED")}
        className="rounded-md border border-breaking/40 px-3 py-1.5 text-xs font-medium text-breaking hover:bg-breaking/10 disabled:opacity-60"
      >
        Tolak
      </button>
    </div>
  );
}
