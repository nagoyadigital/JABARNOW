import Link from "next/link";

/**
 * Breadcrumb — jejak navigasi (Beranda › Kategori › Judul).
 * Item terakhir tanpa tautan (halaman saat ini).
 */
export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 text-xs text-charcoal/50">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link href={item.href} className="hover:text-brand">
                  {item.label}
                </Link>
              ) : (
                <span className={last ? "line-clamp-1 text-charcoal/70" : ""}>
                  {item.label}
                </span>
              )}
              {!last && <span aria-hidden="true">›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
