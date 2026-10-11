import Link from "next/link";
import type { Tag } from "@/lib/types";

/**
 * TagChips — daftar tag artikel sebagai chip (tautan ke arsip tag).
 */
export function TagChips({
  tags,
  className,
}: {
  tags: Tag[];
  className?: string;
}) {
  if (!tags?.length) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ""}`}>
      {tags.map((t) => (
        <Link
          key={t.slug}
          href={`/tag/${t.slug}`}
          className="rounded-full border border-line px-3 py-1 text-xs font-medium text-charcoal/70 transition-colors hover:border-brand hover:text-brand"
        >
          #{t.name}
        </Link>
      ))}
    </div>
  );
}

/**
 * PopularTags — blok "Tag Populer" untuk homepage.
 */
export function PopularTags({
  tags,
}: {
  tags: { slug: string; name: string }[];
}) {
  if (!tags?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <Link
          key={t.slug}
          href={`/tag/${t.slug}`}
          className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-charcoal/80 transition-colors hover:bg-brand hover:text-white"
        >
          #{t.name}
        </Link>
      ))}
    </div>
  );
}
