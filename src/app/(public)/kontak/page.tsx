import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kontak" };

export default function KontakPage() {
  return (
    <div className="container-jn py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold">Kontak</h1>
        <p className="mt-4 text-charcoal/80">
          Informasi kontak redaksi dan iklan akan ditampilkan di sini, dikelola
          melalui Website Settings di CMS.
        </p>
        <p className="mt-2 text-sm text-charcoal/50">Placeholder editorial.</p>
      </div>
    </div>
  );
}
