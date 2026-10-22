import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTagBySlug, listPublishedByTag } from "@/lib/articles";
import { ArticleArchiveList } from "@/components/public/article-list";
import { SectionHeading } from "@/components/public/section-heading";
import { DEMO_CONTENT } from "@/lib/demo";
import { siteConfig } from "@/lib/site-config";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [tag, items] = await Promise.all([getTagBySlug(slug), listPublishedByTag(slug)]);
  const name = tag?.name ?? slug.replace(/-/g, " ");
  return {
    title: `${name} — Berita Terkini`,
    description: `Kumpulan berita tentang ${name} di ${siteConfig.name}.`,
    alternates: { canonical: `/tag/${slug}` },
    // Halaman tag dengan < 2 artikel = konten tipis → jangan diindeks
    robots: items.length < 2 ? { index: false, follow: true } : undefined,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [tag, items] = await Promise.all([getTagBySlug(slug), listPublishedByTag(slug)]);
  if (!tag && !DEMO_CONTENT) notFound();
  const name = tag?.name ?? slug.replace(/-/g, " ");

  return (
    <div className="container-jn py-8">
      <SectionHeading title={`#${name}`} as="h1" />
      <ArticleArchiveList items={items} emptyText="Belum ada artikel dengan tag ini." />
    </div>
  );
}
