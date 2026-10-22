import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRegionBySlug, listPublishedByRegion } from "@/lib/articles";
import { ArticleArchiveList } from "@/components/public/article-list";
import { SectionHeading } from "@/components/public/section-heading";
import { DEMO_CONTENT } from "@/lib/demo";
import { siteConfig } from "@/lib/site-config";
import { breadcrumbLd, jsonLdString } from "@/lib/seo";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const region = await getRegionBySlug(slug);
  const name = region?.name ?? slug.replace(/-/g, " ");
  return {
    title: `Berita ${name} Hari Ini`,
    description: `Berita terbaru dan terkini dari ${name}, Jawa Barat, di ${siteConfig.name}.`,
    alternates: { canonical: `/wilayah/${slug}` },
  };
}

export default async function WilayahDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [region, items] = await Promise.all([getRegionBySlug(slug), listPublishedByRegion(slug)]);
  if (!region && !DEMO_CONTENT) notFound();
  const name = region?.name ?? slug.replace(/-/g, " ");

  return (
    <div className="container-jn py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(
            breadcrumbLd([
              { name: "Beranda", path: "/" },
              { name: "Wilayah", path: "/wilayah" },
              { name, path: `/wilayah/${slug}` },
            ]),
          ),
        }}
      />
      <SectionHeading title={`Berita ${name}`} as="h1" />
      <ArticleArchiveList items={items} emptyText="Belum ada artikel di wilayah ini." />
    </div>
  );
}
