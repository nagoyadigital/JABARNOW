import type { Metadata } from "next";
import { connection } from "next/server";
import { listLatestPublished } from "@/lib/articles";
import { ArticleArchiveList } from "@/components/public/article-list";
import { SectionHeading } from "@/components/public/section-heading";
import { ClockIcon } from "@/components/common/icons";
import { siteConfig } from "@/lib/site-config";

export const instant = false;

export const metadata: Metadata = {
  title: "Berita Terbaru Jawa Barat Hari Ini",
  description: `Berita terbaru dan terkini dari 27 kabupaten/kota di Jawa Barat di ${siteConfig.name}.`,
  alternates: { canonical: "/terbaru" },
};

/** Indeks berita terbaru (tujuan menu "Terbaru" di navigasi bawah mobile). */
export default async function TerbaruPage() {
  await connection();
  const items = await listLatestPublished(30);
  return (
    <div className="container-jn py-8">
      <SectionHeading title="Berita Terbaru" as="h1" icon={ClockIcon} />
      <ArticleArchiveList items={items} emptyText="Belum ada berita terbaru." />
    </div>
  );
}
