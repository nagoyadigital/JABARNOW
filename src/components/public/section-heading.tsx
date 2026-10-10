import Link from "next/link";

/**
 * SectionHeading — judul section dengan aksen brand + tautan "Lihat Semua".
 */
export function SectionHeading({
  title,
  href,
}: {
  title: string;
  href?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="relative pl-3 text-[var(--text-section-mobile)] md:text-[var(--text-section-desktop)]">
        <span className="absolute left-0 top-1/2 h-[1.1em] w-1 -translate-y-1/2 rounded-full bg-brand" />
        {title}
      </h2>
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
