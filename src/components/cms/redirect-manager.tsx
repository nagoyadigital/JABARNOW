"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRedirect, deleteRedirect } from "@/app/cms/seo/actions";

type RedirectRow = {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
};

export function RedirectManager({ rows }: { rows: RedirectRow[] }) {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [code, setCode] = useState("301");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const add = () =>
    start(async () => {
      setMsg("");
      const res = await createRedirect({ fromPath: from, toPath: to, statusCode: Number(code) });
      if (res.ok) {
        setFrom("");
        setTo("");
        router.refresh();
      } else setMsg(res.error ?? "Gagal");
    });

  const remove = (id: string) =>
    start(async () => {
      await deleteRedirect(id);
      router.refresh();
    });

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-base p-5">
      <h2 className="mb-3 text-sm font-semibold">Redirect 301/302</h2>
      <div className="flex flex-wrap items-end gap-2">
        <input
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="/path-lama"
          className="flex-1 rounded-md border border-line bg-base px-3 py-2 text-sm outline-none focus-visible:border-brand"
        />
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="/path-baru atau URL"
          className="flex-1 rounded-md border border-line bg-base px-3 py-2 text-sm outline-none focus-visible:border-brand"
        />
        <select
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="rounded-md border border-line bg-base px-2 py-2 text-sm"
        >
          <option value="301">301</option>
          <option value="302">302</option>
        </select>
        <button
          type="button"
          onClick={add}
          disabled={pending || !from || !to}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
        >
          Tambah
        </button>
      </div>
      {msg && <p className="mt-2 text-sm text-breaking">{msg}</p>}

      {rows.length > 0 && (
        <ul className="mt-4 divide-y divide-line text-sm">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 py-2">
              <span className="truncate">
                <code className="text-charcoal/70">{r.fromPath}</code>
                <span className="mx-2 text-charcoal/40">→</span>
                <code className="text-charcoal/70">{r.toPath}</code>
                <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs">{r.statusCode}</span>
              </span>
              <button
                type="button"
                onClick={() => remove(r.id)}
                disabled={pending}
                className="shrink-0 text-xs text-breaking hover:underline disabled:opacity-60"
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
