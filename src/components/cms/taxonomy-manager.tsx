"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createTaxonomy,
  deleteTaxonomy,
  renameTaxonomy,
  type TaxonomyKind,
  type TaxonomyState,
} from "@/app/cms/taksonomi/actions";

/**
 * Daftar + tambah + ganti nama + hapus Kategori/Tag.
 */
type Row = { id: string; name: string; slug: string; count: number };

const field =
  "w-full rounded-md border border-line bg-base px-3 py-2 text-sm outline-none focus-visible:border-brand";

export function TaxonomyManager({ kind, rows }: { kind: TaxonomyKind; rows: Row[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [msg, setMsg] = useState<TaxonomyState | null>(null);
  const [pending, start] = useTransition();
  const noun = kind === "category" ? "kategori" : "tag";
  const base = kind === "category" ? "/kategori/" : "/tag/";

  const run = (fn: () => Promise<TaxonomyState>, after?: () => void) =>
    start(async () => {
      setMsg(null);
      const res = await fn();
      setMsg(res.ok ? null : res);
      if (res.ok) {
        after?.();
        router.refresh();
      }
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-[var(--radius-card)] border border-line bg-base p-4">
        <input
          aria-label={`Nama ${noun} baru`}
          placeholder={`Nama ${noun} baru`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${field} max-w-xs`}
        />
        <button
          type="button"
          disabled={pending || name.trim().length < 2}
          onClick={() => run(() => createTaxonomy(kind, name), () => setName(""))}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
        >
          Tambah
        </button>
        {msg?.error && <p className="w-full text-xs text-breaking">{msg.error}</p>}
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-base">
        {rows.length === 0 ? (
          <p className="p-5 text-sm text-charcoal/60">Belum ada {noun}.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs text-charcoal/60">
              <tr>
                <th className="px-4 py-2 font-medium">Nama</th>
                <th className="px-4 py-2 font-medium">URL</th>
                <th className="px-4 py-2 text-right font-medium">Artikel</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2">
                    {editing === r.id ? (
                      <input
                        aria-label="Nama baru"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className={field}
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium">{r.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-charcoal/50">
                    {base}
                    {r.slug}
                  </td>
                  <td className="px-4 py-2 text-right">{r.count}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    {editing === r.id ? (
                      <>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => run(() => renameTaxonomy(kind, r.id, draft), () => setEditing(null))}
                          className="rounded px-2 py-1 text-xs font-semibold text-brand hover:bg-brand/10"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(null)}
                          className="rounded px-2 py-1 text-xs text-charcoal/60 hover:bg-muted"
                        >
                          Batal
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(r.id);
                            setDraft(r.name);
                          }}
                          className="rounded px-2 py-1 text-xs text-charcoal/70 hover:bg-muted"
                        >
                          Ganti nama
                        </button>
                        <button
                          type="button"
                          disabled={pending || r.count > 0}
                          title={r.count > 0 ? "Masih dipakai artikel" : undefined}
                          onClick={() => run(() => deleteTaxonomy(kind, r.id))}
                          className="rounded px-2 py-1 text-xs text-breaking hover:bg-breaking/10 disabled:opacity-40"
                        >
                          Hapus
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-xs text-charcoal/50">
        Mengganti nama tidak mengubah URL, agar tautan lama & peringkat Google tetap aman.
      </p>
    </div>
  );
}
