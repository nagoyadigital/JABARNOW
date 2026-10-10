import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * sitemap.xml — Tahap 1: hanya halaman statis.
 * Entri artikel/kategori/wilayah dinamis ditambahkan dari database di Tahap 5
 * (SEO Manager), termasuk news sitemap untuk Google News.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = ["", "/tentang", "/redaksi", "/kontak", "/wilayah"];

  return staticPaths.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.6,
  }));
}
