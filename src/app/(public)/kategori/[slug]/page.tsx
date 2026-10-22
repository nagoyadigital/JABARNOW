import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, listPublishedByCategory } from "@/lib/articles";
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
  const cat = await getCategoryBySlug(slug);
  const name = cat?.name ?? slug.replace(/-/g, " ");
  return {
    title: `Berita ${name} Jawa Barat Terbaru`,
    description:
      cat?.description ?? `Kumpulan berita ${name} terbaru dari Jawa Barat di ${siteConfig.name}.`,
    alternates: { canonical: `/kategori/${slug}` },
  };
}

export default async function KategoriPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [cat, items] = await Promise.all([getCategoryBySlug(slug), listPublishedByCategory(slug)]);
  // Slug tak dikenal → 404 asli (bukan halaman kosong ber-status 200)
  if (!cat && !DEMO_CONTENT) notFound();
  const name = cat?.name ?? slug.replace(/-/g, " ");

  return (
    <div className="container-jn py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(
            breadcrumbLd([
              { name: "Beranda", path: "/" },
              { name, path: `/kategori/${slug}` },
            ]),
          ),
        }}
      />
      <SectionHeading title={name} as="h1" />
      <ArticleArchiveList items={items} emptyText="Belum ada artikel di kategori ini." />
    </div>
  );
}
