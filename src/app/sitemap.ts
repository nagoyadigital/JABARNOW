import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getPublishedSlugs } from "@/lib/articles";

/**
 * sitemap.xml — halaman statis + artikel published dinamis dari DB.
 * Fallback aman bila DB belum tersambung (hanya halaman statis).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPaths = ["", "/tentang", "/redaksi", "/kontak", "/wilayah"];

  const base: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.6,
  }));

  const articles = await getPublishedSlugs();
  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${siteConfig.url}/artikel/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...base, ...articleEntries];
}
