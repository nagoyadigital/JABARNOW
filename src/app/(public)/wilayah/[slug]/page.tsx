import type { Metadata } from "next";
import { listPublishedByRegion } from "@/lib/articles";
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
  return { title: `Wilayah: ${name}` };
}

export default async function WilayahDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const items = await listPublishedByRegion(slug);
  const name = items[0]?.region?.name ?? slug.replace(/-/g, " ");

  return (
    <div className="container-jn py-8">
      <SectionHeading title={name} />
      <ArticleArchiveList items={items} emptyText="Belum ada artikel di wilayah ini." />
    </div>
  );
}
