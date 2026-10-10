"use client";

import { useState } from "react";
import {
  WhatsAppIcon,
  XIcon,
  FacebookIcon,
  LinkIcon,
} from "@/components/common/icons";

/**
 * ShareBar — bagikan artikel ke media sosial + salin tautan.
 * URL diambil dari window saat diklik agar akurat di segala environment.
 */
export function ShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const getUrl = () =>
    typeof window !== "undefined" ? window.location.href : "";

  const open = (url: string) =>
    window.open(url, "_blank", "noopener,noreferrer");

  const shareWA = () =>
    open(`https://wa.me/?text=${encodeURIComponent(`${title} ${getUrl()}`)}`);
  const shareX = () =>
    open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(getUrl())}`,
    );
  const shareFB = () =>
    open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* abaikan */
    }
  };

  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full border border-line text-charcoal/70 transition-colors hover:border-brand hover:text-brand";

  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-xs font-medium text-charcoal/50">Bagikan</span>
      <button type="button" onClick={shareWA} aria-label="Bagikan ke WhatsApp" className={btn}>
        <WhatsAppIcon className="h-4 w-4" />
      </button>
      <button type="button" onClick={shareX} aria-label="Bagikan ke X" className={btn}>
        <XIcon className="h-4 w-4" />
      </button>
      <button type="button" onClick={shareFB} aria-label="Bagikan ke Facebook" className={btn}>
        <FacebookIcon className="h-4 w-4" />
      </button>
      <button type="button" onClick={copy} aria-label="Salin tautan" className={btn}>
        <LinkIcon className="h-4 w-4" />
      </button>
      {copied && <span className="text-xs text-brand">Tersalin!</span>}
    </div>
  );
}
