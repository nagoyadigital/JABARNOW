import type { Metadata } from "next";
import { connection } from "next/server";
import { listMostRead } from "@/lib/articles";
import { ArticleArchiveList } from "@/components/public/article-list";
import { SectionHeading } from "@/components/public/section-heading";
import { siteConfig } from "@/lib/site-config";

export const instant = false;

export const metadata: Metadata = {
  title: "Berita Terpopuler Pekan Ini",
  description: `Berita Jawa Barat yang paling banyak dibaca dalam 7 hari terakhir di ${siteConfig.name}.`,
  alternates: { canonical: "/populer" },
};

/** Berita paling banyak dibaca 7 hari terakhir (menu "Populer" mobile). */
export default async function PopulerPage() {
  await connection();
  const items = await listMostRead(24 * 7, 20);
  return (
    <div className="container-jn py-8">
      <SectionHeading title="Terpopuler 7 Hari" as="h1" />
      <ArticleArchiveList items={items} emptyText="Belum ada data berita populer." />
    </div>
  );
}
