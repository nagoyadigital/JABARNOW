import Link from "next/link";
import type { ComponentType } from "react";
import { NewsIcon } from "@/components/common/icons";

/**
 * SectionHeading — judul section dengan ikon dalam lingkaran oranye muda
 * (pengganti garis aksen; override design lock 2026-10-23) + tautan
 * "Lihat Semua". h2 = kapital berjarak ala portal; h1 = judul halaman arsip.
 */
export function SectionHeading({
  title,
  href,
  icon: Icon = NewsIcon,
  as: Tag = "h2",
}: {
  title: string;
  href?: string;
  /** Komponen ikon (mis. FlameIcon); default ikon koran. */
  icon?: ComponentType<{ className?: string }>;
  /** "h1" untuk judul utama halaman arsip (SEO: satu h1 per halaman). */
  as?: "h1" | "h2";
}) {
  const isH1 = Tag === "h1";
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className={`flex shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand ${
            isH1 ? "h-10 w-10" : "h-8 w-8"
          }`}
        >
          <Icon className={isH1 ? "h-5 w-5" : "h-4 w-4"} />
        </span>
        <Tag
          className={
            isH1
              ? "min-w-0 text-[length:var(--text-section-mobile)] font-extrabold md:text-[length:var(--text-section-desktop)]"
              : "min-w-0 text-sm font-extrabold uppercase tracking-[0.12em] md:text-[15px]"
          }
        >
          {title}
        </Tag>
      </div>
      {href && (
        <Link
          href={href}
          className="group/more flex shrink-0 items-center gap-1 text-sm font-medium text-brand"
        >
          Lihat Semua
          <span aria-hidden="true" className="transition-transform duration-300 group-hover/more:translate-x-1">
            →
          </span>
        </Link>
      )}
    </div>
  );
}
