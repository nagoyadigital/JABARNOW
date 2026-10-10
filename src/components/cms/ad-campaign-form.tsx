"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveCampaign } from "@/app/cms/ads/actions";

const PLACEMENTS = [
  { value: "HEADER_LEADERBOARD", label: "Header Leaderboard" },
  { value: "SIDEBAR", label: "Sidebar" },
  { value: "IN_FEED", label: "In-Feed" },
  { value: "IN_ARTICLE", label: "In-Article" },
  { value: "FOOTER", label: "Footer" },
  { value: "MOBILE_AFTER_HERO", label: "Mobile Setelah Hero" },
];

export function AdCampaignForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [creativeType, setCreativeType] = useState("IMAGE");
  const [placement, setPlacement] = useState("SIDEBAR");
  const [imageUrl, setImageUrl] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [htmlPayload, setHtmlPayload] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      setMsg("");
      const res = await saveCampaign({
        name,
        creativeType: creativeType as never,
        placement: placement as never,
        imageUrl,
        destinationUrl,
        htmlPayload,
        isActive,
        startAt: startAt || undefined,
        endAt: endAt || undefined,
      });
      if (res.ok) {
        setName("");
        setImageUrl("");
        setDestinationUrl("");
        setHtmlPayload("");
        setIsActive(false);
        router.refresh();
        setMsg("Kampanye tersimpan.");
      } else setMsg(res.error ?? "Gagal");
    });

  const field = "w-full rounded-md border border-line bg-base px-3 py-2 text-sm outline-none focus-visible:border-brand";

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-base p-5">
      <h2 className="mb-3 text-sm font-semibold">Kampanye Baru</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs text-charcoal/60">Nama kampanye</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-charcoal/60">Tipe materi</span>
          <select value={creativeType} onChange={(e) => setCreativeType(e.target.value)} className={field}>
            <option value="IMAGE">Gambar/Banner</option>
            <option value="HTML">HTML</option>
            <option value="SCRIPT">Script pihak ketiga</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-charcoal/60">Penempatan</span>
          <select value={placement} onChange={(e) => setPlacement(e.target.value)} className={field}>
            {PLACEMENTS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </label>

        {creativeType === "IMAGE" ? (
          <>
            <label className="block">
              <span className="mb-1 block text-xs text-charcoal/60">URL gambar</span>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={field} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-charcoal/60">URL tujuan</span>
              <input value={destinationUrl} onChange={(e) => setDestinationUrl(e.target.value)} className={field} />
            </label>
          </>
        ) : (
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs text-charcoal/60">
              {creativeType === "SCRIPT" ? "Script (diisolasi saat render)" : "HTML"}
            </span>
            <textarea value={htmlPayload} onChange={(e) => setHtmlPayload(e.target.value)} rows={4} className={field} />
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-xs text-charcoal/60">Mulai (WIB)</span>
          <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-charcoal/60">Selesai (WIB)</span>
          <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className={field} />
        </label>

        <label className="flex items-center gap-2 sm:col-span-2">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          <span className="text-sm">Aktif</span>
        </label>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={pending || !name}
        className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
      >
        {pending ? "Menyimpan…" : "Simpan Kampanye"}
      </button>
      {msg && <p className="mt-2 text-sm text-charcoal/60">{msg}</p>}
    </div>
  );
}
