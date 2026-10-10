"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { BlockEditor } from "@/components/cms/block-editor";
import { saveArticle, submitArticle, type SaveState } from "@/app/cms/artikel/actions";

type Option = { id: string; name: string };

export type ArticleInitial = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  contentJson?: JSONContent;
  categoryId: string | null;
  regionId: string | null;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  status?: string;
};

/**
 * ArticleEditorForm — area menulis kiri + panel metadata/publishing kanan.
 * Autosave dengan status (menyimpan/tersimpan/gagal). Submit untuk review.
 * canPublish/canSchedule mengikuti izin (dilewatkan dari server).
 */
export function ArticleEditorForm({
  initial,
  categories,
  regions,
}: {
  initial: ArticleInitial;
  categories: Option[];
  regions: Option[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [categoryId, setCategoryId] = useState(initial.categoryId ?? "");
  const [regionId, setRegionId] = useState(initial.regionId ?? "");
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle);
  const [seoDescription, setSeoDescription] = useState(initial.seoDescription);
  const [focusKeyword, setFocusKeyword] = useState(initial.focusKeyword);
  const contentRef = useRef<JSONContent>(initial.contentJson ?? { type: "doc", content: [] });
  const [articleId, setArticleId] = useState(initial.id);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markDirty = useCallback((value: boolean) => {
    dirtyRef.current = value;
    setDirty(value);
  }, []);

  const doSave = useCallback(async (): Promise<SaveState> => {
    setSaveStatus("saving");
    const res = await saveArticle({
      id: articleId,
      title: title || "Tanpa Judul",
      slug: slug || undefined,
      excerpt,
      contentJson: contentRef.current,
      categoryId: categoryId || null,
      regionId: regionId || null,
      seoTitle,
      seoDescription,
      focusKeyword,
    });
    if (res.ok) {
      setSaveStatus("saved");
      markDirty(false);
      if (res.id && !articleId) setArticleId(res.id);
      if (res.slug) setSlug(res.slug);
    } else {
      setSaveStatus("error");
      setMessage(res.error ?? "Gagal menyimpan");
    }
    return res;
  }, [articleId, title, slug, excerpt, categoryId, regionId, seoTitle, seoDescription, focusKeyword, markDirty]);

  // Autosave: 2 detik setelah perubahan terakhir
  const scheduleSave = useCallback(() => {
    markDirty(true);
    setSaveStatus("idle");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void doSave(), 2000);
  }, [doSave, markDirty]);

  // Peringatan perubahan belum disimpan
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const onContentChange = useCallback(
    (json: JSONContent) => {
      contentRef.current = json;
      scheduleSave();
    },
    [scheduleSave],
  );

  const handleSubmitReview = async () => {
    const res = await doSave();
    if (!res.ok || !(res.id || articleId)) {
      setMessage(res.error ?? "Simpan dulu sebelum kirim review");
      return;
    }
    const sub = await submitArticle((res.id ?? articleId)!);
    if (sub.ok) {
      setMessage("Terkirim untuk review.");
      router.push("/cms/artikel");
    } else {
      setMessage(sub.error ?? "Gagal mengirim");
    }
  };

  const statusLabel = {
    idle: dirty ? "Belum disimpan" : "Siap",
    saving: "Menyimpan…",
    saved: "Tersimpan",
    error: "Gagal menyimpan",
  }[saveStatus];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Area menulis */}
      <div className="lg:col-span-2">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            scheduleSave();
          }}
          placeholder="Judul artikel"
          className="mb-3 w-full rounded-md border border-line bg-base px-4 py-3 text-2xl font-bold outline-none focus-visible:border-brand"
        />
        <BlockEditor initialContent={initial.contentJson} onChange={onContentChange} />
      </div>

      {/* Panel metadata & publishing */}
      <aside className="space-y-5">
        <div className="rounded-[var(--radius-card)] border border-line bg-base p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Publikasi</span>
            <span
              className={`text-xs ${saveStatus === "error" ? "text-breaking" : "text-charcoal/50"}`}
            >
              {statusLabel}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => void doSave()}
              className="rounded-md border border-line px-3 py-2 text-sm font-medium hover:border-brand hover:text-brand"
            >
              Simpan Draft
            </button>
            <button
              type="button"
              onClick={handleSubmitReview}
              className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand/90"
            >
              Kirim untuk Review
            </button>
          </div>
          {message && <p className="mt-2 text-xs text-charcoal/60">{message}</p>}
        </div>

        <Field label="Slug">
          <input
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              scheduleSave();
            }}
            placeholder="otomatis-dari-judul"
            className="w-full rounded-md border border-line bg-base px-3 py-2 text-sm outline-none focus-visible:border-brand"
          />
        </Field>

        <Field label="Ringkasan (excerpt)">
          <textarea
            value={excerpt}
            onChange={(e) => {
              setExcerpt(e.target.value);
              scheduleSave();
            }}
            rows={3}
            className="w-full rounded-md border border-line bg-base px-3 py-2 text-sm outline-none focus-visible:border-brand"
          />
        </Field>

        <Field label="Kategori">
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              scheduleSave();
            }}
            className="w-full rounded-md border border-line bg-base px-3 py-2 text-sm outline-none focus-visible:border-brand"
          >
            <option value="">— pilih —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Wilayah">
          <select
            value={regionId}
            onChange={(e) => {
              setRegionId(e.target.value);
              scheduleSave();
            }}
            className="w-full rounded-md border border-line bg-base px-3 py-2 text-sm outline-none focus-visible:border-brand"
          >
            <option value="">— pilih —</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="rounded-[var(--radius-card)] border border-line bg-base p-4">
          <p className="mb-3 text-sm font-semibold">SEO</p>
          <Field label="SEO Title">
            <input
              value={seoTitle}
              onChange={(e) => {
                setSeoTitle(e.target.value);
                scheduleSave();
              }}
              className="w-full rounded-md border border-line bg-base px-3 py-2 text-sm outline-none focus-visible:border-brand"
            />
          </Field>
          <div className="mt-3">
            <Field label="Meta Description">
              <textarea
                value={seoDescription}
                onChange={(e) => {
                  setSeoDescription(e.target.value);
                  scheduleSave();
                }}
                rows={2}
                className="w-full rounded-md border border-line bg-base px-3 py-2 text-sm outline-none focus-visible:border-brand"
              />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Focus Keyword">
              <input
                value={focusKeyword}
                onChange={(e) => {
                  setFocusKeyword(e.target.value);
                  scheduleSave();
                }}
                className="w-full rounded-md border border-line bg-base px-3 py-2 text-sm outline-none focus-visible:border-brand"
              />
            </Field>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-charcoal/60">{label}</span>
      {children}
    </label>
  );
}
