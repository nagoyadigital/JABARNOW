import Link from "next/link";
import { ArrowLeftIcon, ChevronRightIcon } from "@/components/common/icons";

/**
 * Breadcrumb — jejak navigasi (← Beranda › KATEGORI › Judul).
 * Item pertama berpanah kembali; item tengah kapital; item terakhir (halaman
 * saat ini, tanpa tautan) turun ke baris sendiri di HP dan dipotong 1 baris.
 */
export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-sm text-charcoal/50">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className={`flex min-w-0 items-center gap-2 ${last ? "max-md:basis-full" : ""}`}>
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 font-medium transition-colors hover:text-brand ${i > 0 ? "uppercase" : ""}`}
                >
                  {i === 0 && <ArrowLeftIcon className="h-4 w-4" />}
                  {item.label}
                </Link>
              ) : (
                <span className={last ? "truncate font-medium text-charcoal" : ""}>
                  {item.label}
                </span>
              )}
              {!last && <ChevronRightIcon className="h-3.5 w-3.5 shrink-0" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
