import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { siteConfig } from "@/lib/site-config";
import { getPublishedSlugs, listTaxonomySlugs } from "@/lib/articles";

/**
 * sitemap.xml — halaman statis, arsip (kategori/wilayah/tag) & artikel tayang.
 * Dibuat saat diminta (data DB terbaru); fallback aman bila DB belum tersambung.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const base = siteConfig.url.replace(/\/+$/, "");
  const [articles, tax] = await Promise.all([getPublishedSlugs(), listTaxonomySlugs()]);
  const latest = articles[0]?.updatedAt ?? new Date();

  const page = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
    lastModified: Date = latest,
  ) => ({ url: `${base}${path}`, lastModified, changeFrequency, priority });

  return [
    page("", 1, "hourly"),
    page("/terbaru", 0.8, "hourly"),
    page("/populer", 0.7, "hourly"),
    page("/wilayah", 0.6, "daily"),
    ...["/tentang", "/redaksi", "/kontak", "/pedoman", "/privasi", "/syarat", "/disclaimer"].map((p) =>
      page(p, 0.3, "monthly"),
    ),
    ...tax.categories.map((s) => page(`/kategori/${s}`, 0.7, "hourly")),
    ...tax.regions.map((s) => page(`/wilayah/${s}`, 0.6, "daily")),
    ...tax.tags.map((s) => page(`/tag/${s}`, 0.4, "daily")),
    ...articles.map((a) => page(`/artikel/${a.slug}`, 0.8, "weekly", a.updatedAt)),
  ];
}
