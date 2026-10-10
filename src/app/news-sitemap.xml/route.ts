import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

/**
 * Google News sitemap — artikel published 2 hari terakhir.
 * Format khusus news:news. Fallback kosong bila DB belum tersambung.
 */
export async function GET() {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  let articles: { slug: string; title: string; publishedAt: Date | null }[] = [];
  try {
    articles = await prisma.article.findMany({
      where: { status: "PUBLISHED", publishedAt: { gte: twoDaysAgo } },
      select: { slug: true, title: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 1000,
    });
  } catch {
    articles = [];
  }

  const items = articles
    .map(
      (a) => `  <url>
    <loc>${siteConfig.url}/artikel/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${siteConfig.name}</news:name>
        <news:language>id</news:language>
      </news:publication>
      <news:publication_date>${a.publishedAt?.toISOString() ?? new Date().toISOString()}</news:publication_date>
      <news:title>${escapeXml(a.title)}</news:title>
    </news:news>
  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
