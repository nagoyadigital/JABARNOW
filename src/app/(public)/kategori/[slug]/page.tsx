import type { Metadata } from "next";
import { listPublishedByCategory } from "@/lib/articles";
import { ArticleArchiveList } from "@/components/public/article-list";
import { SectionHeading } from "@/components/public/section-heading";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.replace(/-/g, " ");
  return { title: `Kategori: ${name}` };
}

export default async function KategoriPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const items = await listPublishedByCategory(slug);
  const name = items[0]?.category?.name ?? slug.replace(/-/g, " ");

  return (
    <div className="container-jn py-8">
      <SectionHeading title={`Kategori: ${name}`} />
      <ArticleArchiveList items={items} emptyText="Belum ada artikel di kategori ini." />
    </div>
  );
}
