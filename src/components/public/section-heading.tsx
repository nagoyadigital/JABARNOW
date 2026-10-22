import Link from "next/link";
import type { ReactNode } from "react";

/**
 * SectionHeading — judul section dengan aksen brand + tautan "Lihat Semua".
 * Opsional: ikon di samping judul (mis. ikon api untuk Most Read).
 */
export function SectionHeading({
  title,
  href,
  icon,
  as: Tag = "h2",
}: {
  title: string;
  href?: string;
  icon?: ReactNode;
  /** "h1" untuk judul utama halaman arsip (SEO: satu h1 per halaman). */
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <Tag className="relative flex items-center gap-2 pl-3 text-[length:var(--text-section-mobile)] md:text-[length:var(--text-section-desktop)]">
        <span className="absolute left-0 top-1/2 h-[1.1em] w-1 -translate-y-1/2 rounded-full bg-brand" />
        {icon}
        {title}
      </Tag>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-brand hover:underline"
        >
          Lihat Semua
        </Link>
      )}
    </div>
  );
}
