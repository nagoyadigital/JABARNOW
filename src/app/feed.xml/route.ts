import { connection } from "next/server";
import { siteConfig } from "@/lib/site-config";
import { listLatestPublished } from "@/lib/articles";

/**
 * RSS 2.0 JabarNow! — 30 artikel terbaru. Untuk agregator berita,
 * pembaca RSS, dan sindikasi. Fallback: feed kosong bila DB belum tersambung.
 */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  await connection(); // selalu data terbaru dari DB (bukan prerender saat build)
  const base = siteConfig.url.replace(/\/+$/, "");
  const items = await listLatestPublished(30);

  const body = items
    .map((a) => {
      const link = `${base}/artikel/${a.slug}`;
      return `    <item>
      <title>${esc(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      ${a.publishedAt ? `<pubDate>${a.publishedAt.toUTCString()}</pubDate>` : ""}
      ${a.excerpt ? `<description>${esc(a.excerpt)}</description>` : ""}
      <dc:creator>${esc(a.author.name)}</dc:creator>
      ${a.category ? `<category>${esc(a.category.name)}</category>` : ""}
      ${a.cover?.url ? `<enclosure url="${esc(a.cover.url)}" type="image/jpeg" length="0" />` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(siteConfig.name)} — ${esc(siteConfig.tagline)}</title>
    <link>${base}</link>
    <description>${esc(siteConfig.description)}</description>
    <language>id-ID</language>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
    ${items[0]?.publishedAt ? `<lastBuildDate>${items[0].publishedAt.toUTCString()}</lastBuildDate>` : ""}
${body}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
