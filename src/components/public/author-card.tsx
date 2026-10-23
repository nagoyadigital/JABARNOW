import Link from "next/link";

/**
 * AuthorCard — kartu penulis di kolom kanan artikel: avatar inisial, nama,
 * peran redaksi, profil singkat JabarNow!, tombol ke berita terbaru.
 * (Belum ada bio per penulis & halaman profil penulis di skema.)
 */
export function AuthorCard({ name, roleLabel }: { name: string; roleLabel?: string }) {
  return (
    <section
      aria-label="Penulis artikel"
      className="rounded-2xl border border-line bg-base p-6 shadow-[0_8px_24px_-18px_rgba(23,25,29,0.35)]"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-breaking to-brand text-lg font-bold text-white"
        >
          {name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold">{name}</p>
          <p className="text-xs text-charcoal/50">{roleLabel ?? "Redaksi"} · JabarNow!</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-charcoal/60">
        Menyajikan berita terkini, akurat, dan terverifikasi dari 27 kabupaten/kota
        di Jawa Barat.
      </p>
      <Link
        href="/terbaru"
        className="mt-5 block rounded-xl bg-muted py-2.5 text-center text-sm font-semibold text-charcoal/80 transition-colors hover:bg-brand hover:text-white"
      >
        Lihat Berita Terbaru
      </Link>
    </section>
  );
}
