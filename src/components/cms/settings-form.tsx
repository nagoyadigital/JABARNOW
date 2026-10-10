"use client";

import { useState, useTransition } from "react";
import { saveGeneralSettings } from "@/app/cms/settings/actions";

type General = {
  siteName: string;
  tagline: string;
  contactEmail: string;
  gscVerification: string;
  commentsEnabled: boolean;
};

export function SettingsForm({ initial }: { initial: General }) {
  const [form, setForm] = useState(initial);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const setText =
    (k: "siteName" | "tagline" | "contactEmail" | "gscVerification") =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () =>
    start(async () => {
      setMsg("");
      const res = await saveGeneralSettings(form);
      setMsg(res.ok ? "Tersimpan." : (res.error ?? "Gagal"));
    });

  const field = "w-full rounded-md border border-line bg-base px-3 py-2 text-sm outline-none focus-visible:border-brand";

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-base p-5">
      <h2 className="mb-4 text-sm font-semibold">Umum</h2>
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs text-charcoal/60">Nama Website</span>
          <input value={form.siteName} onChange={setText("siteName")} className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-charcoal/60">Tagline</span>
          <input value={form.tagline} onChange={setText("tagline")} className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-charcoal/60">Email Kontak</span>
          <input value={form.contactEmail} onChange={setText("contactEmail")} className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-charcoal/60">
            Google Search Console Verification
          </span>
          <input value={form.gscVerification} onChange={setText("gscVerification")} className={field} />
        </label>

        {/* Toggle fitur komentar publik */}
        <label className="flex items-center justify-between gap-3 rounded-md border border-line p-3">
          <span>
            <span className="block text-sm font-medium">Kolom Komentar Publik</span>
            <span className="block text-xs text-charcoal/50">
              Jika aktif, pembaca (login) bisa berkomentar di artikel. Reaksi emote
              selalu aktif.
            </span>
          </span>
          <input
            type="checkbox"
            checked={form.commentsEnabled}
            onChange={(e) => setForm((f) => ({ ...f, commentsEnabled: e.target.checked }))}
            className="h-5 w-5 shrink-0 accent-[var(--color-brand)]"
          />
        </label>

        <div className="rounded-md bg-muted p-3 text-xs text-charcoal/60">
          Timezone editorial: <strong>Asia/Jakarta (WIB)</strong> · Bahasa:
          Indonesia. Logo &amp; favicon serta visual tokens hanya dapat diubah
          Super Admin (design.manage).
        </div>
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
      >
        {pending ? "Menyimpan…" : "Simpan"}
      </button>
      {msg && <p className="mt-2 text-sm text-charcoal/60">{msg}</p>}
    </div>
  );
}
