import type { Metadata } from "next";

export const metadata: Metadata = { title: "Redaksi" };

export default function RedaksiPage() {
  return (
    <div className="container-jn py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold">Redaksi</h1>
        <p className="mt-4 text-charcoal/80">
          Susunan redaksi JabarNow! akan ditampilkan di sini dan dikelola melalui
          CMS.
        </p>
        <p className="mt-2 text-sm text-charcoal/50">
          Placeholder editorial — dapat disunting redaksi.
        </p>
      </div>
    </div>
  );
}
