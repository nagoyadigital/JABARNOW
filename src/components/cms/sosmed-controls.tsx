"use client";

/* eslint-disable @next/next/no-img-element -- pratinjau PNG dinamis dari route render */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  decideSocialPost,
  generateSocialPackage,
  saveSocialPost,
  updateBrandKit,
  type SocialActionState,
} from "@/app/cms/sosmed/actions";
import type { Slide } from "@/lib/social/content";
import type { BrandKit, TemplateKey } from "@/lib/social/brand-kit";

/**
 * Kontrol klien Studio Sosmed. Semua aksi diverifikasi server-side.
 */

const field =
  "w-full rounded-md border border-line bg-base px-3 py-2 text-sm outline-none focus-visible:border-brand";
const label = "mb-1 block text-xs font-medium text-charcoal/60";
const btnPrimary =
  "rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60";
const btnGhost =
  "rounded-md border border-line px-3 py-2 text-sm font-medium text-charcoal/80 hover:bg-muted disabled:opacity-60";

function Message({ state }: { state: SocialActionState | null }) {
  if (!state) return null;
  const text = state.error ?? state.message ?? (state.ok ? "Berhasil." : "");
  if (!text) return null;
  return (
    <p role="status" className={`text-xs ${state.error ? "text-breaking" : "text-charcoal/60"}`}>
      {text}
    </p>
  );
}

/** Tombol "Buat paket sosmed" untuk artikel yang belum punya paket. */
export function GeneratePackageButton({
  articleId,
  force,
  label: text,
}: {
  articleId: string;
  force?: boolean;
  label?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<SocialActionState | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        className={force ? btnGhost : btnPrimary}
        onClick={() =>
          start(async () => {
            setState(null);
            const res = await generateSocialPackage(articleId, force);
            setState(res);
            router.refresh();
          })
        }
      >
        {pending ? "Membuat…" : (text ?? "Buat paket sosmed")}
      </button>
      <Message state={state} />
    </div>
  );
}

/** Pratinjau slide besar + thumbnail + unduh. */
export function SlidePreview({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[Math.min(active, images.length - 1)];

  const downloadAll = () => {
    images.forEach((src, i) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = `${src}&dl=1`;
        a.download = `${name}-${i + 1}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, i * 400);
    });
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-muted">
        <img src={current} alt={`Slide ${active + 1}`} className="aspect-[4/5] w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Lihat slide ${i + 1}`}
              aria-current={i === active}
              className={`w-16 shrink-0 overflow-hidden rounded border-2 ${
                i === active ? "border-brand" : "border-transparent"
              }`}
            >
              <img src={src} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={downloadAll} className={btnPrimary}>
          {images.length > 1 ? `Download semua (${images.length})` : "Download"}
        </button>
        {images.length > 1 && (
          <a href={`${current}&dl=1`} download className={btnGhost}>
            Slide {active + 1}
          </a>
        )}
      </div>
    </div>
  );
}

type EditorProps = {
  id: string;
  format: "SINGLE" | "CAROUSEL";
  readOnly: boolean;
  templates: { key: TemplateKey; name: string; hint: string }[];
  initial: {
    template: TemplateKey;
    kicker: string;
    headline: string;
    headlineAlts: string[];
    highlight: string;
    slides: Slide[];
    caption: string;
    hashtags: string[];
    usePhoto: boolean;
    hasPhoto: boolean;
  };
};

/** Editor teks + template satu konten sosmed. */
export function SocialPostEditor({ id, format, readOnly, templates, initial }: EditorProps) {
  const router = useRouter();
  const [template, setTemplate] = useState<TemplateKey>(initial.template);
  const [kicker, setKicker] = useState(initial.kicker);
  const [headline, setHeadline] = useState(initial.headline);
  const [highlight, setHighlight] = useState(initial.highlight);
  const [slides, setSlides] = useState<Slide[]>(initial.slides);
  const [caption, setCaption] = useState(initial.caption);
  const [hashtags, setHashtags] = useState(initial.hashtags.join(" "));
  const [usePhoto, setUsePhoto] = useState(initial.usePhoto);
  const [state, setState] = useState<SocialActionState | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  const points = slides.filter((s) => s.kind === "point");
  const setPoint = (pointIndex: number, body: string) => {
    let n = -1;
    setSlides(slides.map((s) => (s.kind === "point" && ++n === pointIndex ? { ...s, body } : s)));
  };
  const addPoint = () => {
    const ctaAt = slides.findIndex((s) => s.kind === "cta");
    const next = [...slides];
    next.splice(ctaAt < 0 ? next.length : ctaAt, 0, { kind: "point", body: "" });
    setSlides(next);
  };
  const removePoint = (pointIndex: number) => {
    let n = -1;
    setSlides(slides.filter((s) => !(s.kind === "point" && ++n === pointIndex)));
  };

  const save = () =>
    start(async () => {
      setState(null);
      const res = await saveSocialPost({
        id,
        template,
        kicker,
        headline,
        highlight,
        slides: slides.filter((s) => s.kind !== "point" || (s.body ?? "").trim().length > 0),
        caption,
        hashtags,
        usePhoto,
      });
      setState(res);
      if (res.ok) router.refresh();
    });

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(`${caption}\n\n${hashtags}`.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setState({ error: "Browser menolak akses clipboard." });
    }
  };

  return (
    <fieldset disabled={readOnly || pending} className="space-y-5">
      <div>
        <span className={label}>Template</span>
        <div className="grid gap-2 sm:grid-cols-3">
          {templates.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTemplate(t.key)}
              aria-pressed={template === t.key}
              className={`rounded-md border p-3 text-left text-xs ${
                template === t.key ? "border-brand bg-brand/5" : "border-line hover:bg-muted"
              }`}
            >
              <span className="block text-sm font-semibold">{t.name}</span>
              <span className="text-charcoal/60">{t.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
        <label className="block">
          <span className={label}>Kicker</span>
          <input value={kicker} onChange={(e) => setKicker(e.target.value)} maxLength={30} className={field} />
        </label>
        <label className="block">
          <span className={label}>Kata sorotan (warna oranye, harus ada di headline)</span>
          <input value={highlight} onChange={(e) => setHighlight(e.target.value)} maxLength={40} className={field} />
        </label>
      </div>

      <label className="block">
        <span className={label}>Headline di gambar ({headline.length}/110)</span>
        <textarea
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          rows={2}
          maxLength={140}
          className={field}
        />
      </label>
      {initial.headlineAlts.length > 0 && (
        <div>
          <span className={label}>Alternatif headline (klik untuk pakai)</span>
          <div className="flex flex-wrap gap-2">
            {initial.headlineAlts.map((alt) => (
              <button
                key={alt}
                type="button"
                onClick={() => setHeadline(alt)}
                className="rounded-full border border-line px-3 py-1 text-left text-xs hover:border-brand"
              >
                {alt}
              </button>
            ))}
          </div>
        </div>
      )}

      {initial.hasPhoto && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={usePhoto} onChange={(e) => setUsePhoto(e.target.checked)} />
          Pakai foto cover artikel sebagai latar
        </label>
      )}

      {format === "CAROUSEL" && (
        <div className="space-y-3">
          <span className={label}>Isi slide carousel</span>
          {points.map((p, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-2 w-14 shrink-0 text-xs font-semibold text-charcoal/50">Slide {i + 2}</span>
              <textarea
                value={p.body ?? ""}
                onChange={(e) => setPoint(i, e.target.value)}
                rows={3}
                maxLength={260}
                className={field}
              />
              {points.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePoint(i)}
                  className="mt-1 rounded px-2 py-1 text-xs text-breaking hover:bg-breaking/10"
                  aria-label={`Hapus slide ${i + 2}`}
                >
                  Hapus
                </button>
              )}
            </div>
          ))}
          {points.length < 5 && (
            <button type="button" onClick={addPoint} className={btnGhost}>
              + Tambah slide
            </button>
          )}
        </div>
      )}

      <label className="block">
        <span className={label}>Caption</span>
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={6} className={field} />
      </label>
      <label className="block">
        <span className={label}>Hashtag (pisahkan dengan spasi)</span>
        <input value={hashtags} onChange={(e) => setHashtags(e.target.value)} className={field} />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        {!readOnly && (
          <button type="button" onClick={save} className={btnPrimary}>
            {pending ? "Menyimpan…" : "Simpan & render ulang"}
          </button>
        )}
        <button type="button" onClick={copyCaption} disabled={false} className={btnGhost}>
          {copied ? "Tersalin" : "Copy caption + hashtag"}
        </button>
        <Message state={state} />
      </div>
    </fieldset>
  );
}

/** Panel keputusan (hanya pemegang social.approve). */
export function SocialDecisionPanel({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [state, setState] = useState<SocialActionState | null>(null);
  const [pending, start] = useTransition();

  const act = (decision: "APPROVED" | "REJECTED" | "PENDING_REVIEW") =>
    start(async () => {
      setState(null);
      const res = await decideSocialPost(id, decision, note);
      setState(res);
      if (res.ok) router.refresh();
    });

  if (status === "POSTED" || status === "SCHEDULED") return null;

  return (
    <div className="space-y-3 rounded-[var(--radius-card)] border border-line bg-base p-4">
      <h2 className="text-sm font-semibold">Keputusan Pimred</h2>
      {status === "PENDING_REVIEW" || status === "FAILED" ? (
        <>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Catatan (wajib bila menolak)"
            className={field}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={pending} onClick={() => act("APPROVED")} className={btnPrimary}>
              Setujui
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => act("REJECTED")}
              className="rounded-md border border-breaking/40 px-3 py-2 text-sm font-medium text-breaking hover:bg-breaking/10 disabled:opacity-60"
            >
              Tolak
            </button>
          </div>
        </>
      ) : (
        <button type="button" disabled={pending} onClick={() => act("PENDING_REVIEW")} className={btnGhost}>
          Kembalikan ke review
        </button>
      )}
      <Message state={state} />
    </div>
  );
}

/** Form Brand Kit. */
export function BrandKitForm({
  initial,
  templates,
}: {
  initial: BrandKit;
  templates: { key: TemplateKey; name: string }[];
}) {
  const router = useRouter();
  const [kit, setKit] = useState(initial);
  const [tags, setTags] = useState(initial.baseHashtags.join(" "));
  const [state, setState] = useState<SocialActionState | null>(null);
  const [pending, start] = useTransition();
  const set = <K extends keyof BrandKit>(k: K, v: BrandKit[K]) => setKit({ ...kit, [k]: v });

  const save = () =>
    start(async () => {
      setState(null);
      const res = await updateBrandKit({
        ...kit,
        baseHashtags: tags.split(/[\s,]+/).filter(Boolean),
      });
      setState(res);
      if (res.ok) router.refresh();
    });

  return (
    <fieldset disabled={pending} className="space-y-5 rounded-[var(--radius-card)] border border-line bg-base p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Handle / watermark</span>
          <input value={kit.handle} onChange={(e) => set("handle", e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className={label}>Nama brand</span>
          <input value={kit.brandName} onChange={(e) => set("brandName", e.target.value)} className={field} />
        </label>
      </div>
      <label className="block">
        <span className={label}>Judul slide penutup (CTA)</span>
        <input value={kit.ctaTitle} onChange={(e) => set("ctaTitle", e.target.value)} className={field} />
      </label>
      <label className="block">
        <span className={label}>Teks slide penutup</span>
        <textarea value={kit.ctaText} onChange={(e) => set("ctaText", e.target.value)} rows={2} className={field} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Template default</span>
          <select
            value={kit.defaultTemplate}
            onChange={(e) => set("defaultTemplate", e.target.value as TemplateKey)}
            className={field}
          >
            {templates.map((t) => (
              <option key={t.key} value={t.key}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={label}>Jumlah slide isi carousel</span>
          <select
            value={kit.carouselPoints}
            onChange={(e) => set("carouselPoints", Number(e.target.value))}
            className={field}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} slide isi ({n + 2} total dengan cover & penutup)
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className={label}>Hashtag tetap (maks 5)</span>
        <input value={tags} onChange={(e) => setTags(e.target.value)} className={field} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={kit.autoGenerate}
          onChange={(e) => set("autoGenerate", e.target.checked)}
        />
        Buat paket sosmed otomatis saat artikel disetujui / tayang
      </label>
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} className={btnPrimary}>
          Simpan Brand Kit
        </button>
        <Message state={state} />
      </div>
    </fieldset>
  );
}
