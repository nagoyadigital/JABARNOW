import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-2xl font-semibold">Akses ditolak</h1>
      <p className="mt-2 text-sm text-charcoal/60">
        Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi
        administrator bila ini keliru.
      </p>
      <Link
        href="/cms"
        className="mt-6 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90"
      >
        Kembali ke Overview
      </Link>
    </div>
  );
}
