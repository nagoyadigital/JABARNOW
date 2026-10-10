import Image from "next/image";
import type { Article } from "@/lib/types";

/**
 * CoverImage — gambar cover artikel dengan focal point + fallback.
 * variant "overlay": teks putih di atas gambar → fallback gelap (teks terbaca).
 * variant "card": gambar di atas kartu putih → fallback terang (netral).
 */
export function CoverImage({
  article,
  priority = false,
  sizes,
  className,
  variant = "card",
}: {
  article: Pick<Article, "image" | "title" | "focalX" | "focalY">;
  priority?: boolean;
  sizes?: string;
  className?: string;
  variant?: "overlay" | "card";
}) {
  const objectPosition = `${(article.focalX ?? 0.5) * 100}% ${
    (article.focalY ?? 0.5) * 100
  }%`;

  if (!article.image) {
    const fallbackCls =
      variant === "overlay"
        ? "bg-gradient-to-br from-charcoal/80 to-charcoal"
        : "bg-gradient-to-br from-muted to-line";
    const labelCls =
      variant === "overlay" ? "text-white/40" : "text-charcoal/40";
    return (
      <div
        className={`flex items-center justify-center ${fallbackCls} ${className ?? ""}`}
        aria-hidden="true"
      >
        <span className={`text-xs font-medium ${labelCls}`}>JabarNow!</span>
      </div>
    );
  }

  return (
    <Image
      src={article.image}
      alt={article.title}
      fill
      priority={priority}
      sizes={sizes}
      className={`object-cover ${className ?? ""}`}
      style={{ objectPosition }}
    />
  );
}
