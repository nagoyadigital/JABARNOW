"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * MediaUploader — pilih file / drag & drop, unggah ke R2 via API.
 * Menampilkan progress sederhana + error.
 */
export function MediaUploader({ storageReady }: { storageReady: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/media/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mengunggah");
      } else {
        router.refresh();
      }
    } catch {
      setError("Gagal menghubungi server");
    } finally {
      setBusy(false);
    }
  };

  if (!storageReady) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-muted p-6 text-center text-sm text-charcoal/60">
        Storage Cloudflare R2 belum dikonfigurasi. Isi variabel R2_* di{" "}
        <code>.env</code> untuk mengaktifkan upload.
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) void upload(f);
        }}
        className="rounded-[var(--radius-card)] border border-dashed border-line bg-muted p-8 text-center"
      >
        <p className="text-sm text-charcoal/60">
          Tarik & lepas gambar di sini, atau
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="mt-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
        >
          {busy ? "Mengunggah…" : "Pilih File"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
        <p className="mt-2 text-xs text-charcoal/40">JPG, PNG, WebP, GIF, AVIF · maks 10 MB</p>
      </div>
      {error && <p className="mt-2 text-sm text-breaking">{error}</p>}
    </div>
  );
}
