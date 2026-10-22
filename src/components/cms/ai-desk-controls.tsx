"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addSource,
  checkFeed,
  deleteSource,
  runScoutNow,
  setTopicSkipped,
  toggleSource,
  type ActionState,
} from "@/app/cms/ai-desk/actions";

/**
 * Kontrol klien AI Desk: form sumber, tombol Scout, aksi baris sumber & topik.
 * Semua aksi tetap diverifikasi server-side (ai.manage).
 */

const field =
  "w-full rounded-md border border-line bg-base px-3 py-2 text-sm outline-none focus-visible:border-brand";
const btnPrimary =
  "rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60";
const btnGhost =
  "rounded-md border border-line px-3 py-1.5 text-xs font-medium text-charcoal/80 hover:bg-muted disabled:opacity-60";

function Message({ state }: { state: ActionState | null }) {
  if (!state) return null;
  const text = state.error ?? state.message ?? (state.ok ? "Berhasil." : "");
  if (!text) return null;
  return (
    <p role="status" className={`text-xs ${state.error ? "text-breaking" : "text-charcoal/60"}`}>
      {text}
    </p>
  );
}

/** Form tambah sumber + tombol "Cek feed". */
export function AiSourceForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [kind, setKind] = useState<"RSS" | "TRENDS">("RSS");
  const [state, setState] = useState<ActionState | null>(null);
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      setState(null);
      const res = await addSource({ name, url, language, kind });
      setState(res);
      if (res.ok) {
        setName("");
        setUrl("");
        router.refresh();
      }
    });

  const check = () =>
    start(async () => {
      setState(null);
      setState(await checkFeed(url));
    });

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-base p-5">
      <h2 className="mb-1 text-sm font-semibold">Tambah sumber</h2>
      <p className="mb-3 text-xs text-charcoal/60">
        Tempel URL RSS/Atom. Untuk Google Trends pakai tipe &quot;Trends&quot;, contoh{" "}
        <code>https://trends.google.com/trending/rss?geo=ID</code>.
      </p>
      <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto_auto]">
        <input
          aria-label="Nama sumber"
          placeholder="Nama (mis. Antara Jabar)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={field}
        />
        <input
          aria-label="URL feed"
          placeholder="https://contoh.com/feed"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={field}
        />
        <select
          aria-label="Bahasa"
          value={language}
          onChange={(e) => setLanguage(e.target.value as "id" | "en")}
          className={field}
        >
          <option value="id">Indonesia</option>
          <option value="en">Inggris</option>
        </select>
        <select
          aria-label="Tipe"
          value={kind}
          onChange={(e) => setKind(e.target.value as "RSS" | "TRENDS")}
          className={field}
        >
          <option value="RSS">RSS/Atom</option>
          <option value="TRENDS">Trends</option>
        </select>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" disabled={pending || !name || !url} onClick={submit} className={btnPrimary}>
          Tambah
        </button>
        <button type="button" disabled={pending || !url} onClick={check} className={btnGhost}>
          Cek feed
        </button>
        <Message state={state} />
      </div>
    </div>
  );
}

/** Tombol "Cari topik sekarang" (semua sumber aktif, atau satu sumber). */
export function RunScoutButton({ sourceId, label }: { sourceId?: string; label?: string }) {
  const router = useRouter();
  const [state, setState] = useState<ActionState | null>(null);
  const [pending, start] = useTransition();

  const run = () =>
    start(async () => {
      setState(null);
      const res = await runScoutNow(sourceId);
      setState(res);
      router.refresh();
    });

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={run}
        className={sourceId ? btnGhost : btnPrimary}
      >
        {pending ? "Mencari…" : (label ?? "Cari topik sekarang")}
      </button>
      <Message state={state} />
    </div>
  );
}

/** Aksi per baris sumber: aktif/nonaktif + hapus. */
export function SourceRowActions({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<ActionState | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  const act = (fn: () => Promise<ActionState>) =>
    start(async () => {
      setState(null);
      const res = await fn();
      if (!res.ok) setState(res);
      setConfirming(false);
      router.refresh();
    });

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          aria-label={isActive ? "Nonaktifkan sumber" : "Aktifkan sumber"}
          disabled={pending}
          onClick={() => act(() => toggleSource(id, !isActive))}
          className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-60 ${
            isActive ? "bg-brand" : "bg-line"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              isActive ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        {confirming ? (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => act(() => deleteSource(id))}
              className="rounded-md bg-breaking px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              Yakin hapus
            </button>
            <button type="button" onClick={() => setConfirming(false)} className={btnGhost}>
              Batal
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirming(true)}
            className="rounded-md px-2 py-1.5 text-xs font-medium text-breaking hover:bg-breaking/10"
          >
            Hapus
          </button>
        )}
      </div>
      <Message state={state} />
    </div>
  );
}

/** Abaikan / kembalikan topik di Radar. */
export function TopicSkipButton({ id, skipped }: { id: string; skipped: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<ActionState | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await setTopicSkipped(id, !skipped);
            if (!res.ok) setState(res);
            router.refresh();
          })
        }
        className={btnGhost}
      >
        {skipped ? "Kembalikan" : "Abaikan"}
      </button>
      <Message state={state} />
    </div>
  );
}
