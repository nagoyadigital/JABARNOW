import type { Metadata } from "next";
import { listPublishedByTag } from "@/lib/articles";
import { ArticleArchiveList } from "@/components/public/article-list";
import { SectionHeading } from "@/components/public/section-heading";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Tag: ${slug.replace(/-/g, " ")}` };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const items = await listPublishedByTag(slug);
  const tagName = items[0]?.tags?.find((t) => t.tag.slug === slug)?.tag.name ?? slug.replace(/-/g, " ");

  return (
    <div className="container-jn py-8">
      <SectionHeading title={`#${tagName}`} />
      <ArticleArchiveList items={items} emptyText="Belum ada artikel dengan tag ini." />
    </div>
  );
}
