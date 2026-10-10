import Link from "next/link";

/**
 * CmsTopbar — topbar terang: global search, notifikasi, lihat website, akun.
 * Interaksi penuh (search, notifikasi dashboard, menu akun) di Tahap 3.
 */
export function CmsTopbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-base px-4 md:px-6">
      <div className="flex flex-1 items-center gap-3">
        <input
          type="search"
          placeholder="Cari artikel, penulis, kategori..."
          className="w-full max-w-md rounded-md border border-line bg-muted px-3 py-2 text-sm outline-none focus-visible:border-brand"
          aria-label="Pencarian global CMS"
        />
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="hidden text-sm text-charcoal/70 transition-colors hover:text-brand sm:inline"
        >
          Lihat Website
        </Link>
        <button
          type="button"
          aria-label="Notifikasi"
          className="h-9 w-9 rounded-full border border-line bg-muted"
        />
        <button
          type="button"
          aria-label="Menu akun"
          className="h-9 w-9 rounded-full bg-brand/90 text-sm font-semibold text-white"
        >
          JN
        </button>
      </div>
    </header>
  );
}
