import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Tentang Kami" };

export default function TentangPage() {
  return (
    <div className="container-jn py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold">Tentang {siteConfig.name}</h1>
        <div className="mt-4 space-y-4 text-charcoal/80">
          <p>
            {siteConfig.name} adalah portal berita Jawa Barat yang menyajikan
            berita terbaru, terpopuler, dan informasi dari 27 kabupaten/kota.
          </p>
          <p className="text-sm text-charcoal/50">
            Konten halaman ini akan dikelola melalui CMS. Teks ini placeholder
            editorial dan dapat disunting oleh redaksi.
          </p>
        </div>
      </div>
    </div>
  );
}
