import { XMLParser } from "fast-xml-parser";

/**
 * Parser feed berita — RSS 2.0, Atom, RSS 1.0 (RDF), dan Google Trends RSS.
 * Murni (tanpa I/O) supaya mudah diuji. Format terdeteksi otomatis dari isi XML.
 */

export type FeedItem = {
  title: string;
  url: string;
  summary: string | null;
  imageUrl: string | null;
  author: string | null;
  publishedAt: Date | null;
};

type Node = Record<string, unknown>;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // Pertahankan teks apa adanya (judul "2026" tidak boleh jadi angka)
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
  cdataPropName: false,
  processEntities: true,
  htmlEntities: true,
  // Elemen yang bisa muncul sekali atau berkali-kali selalu jadi array
  isArray: (name) =>
    ["item", "entry", "link", "media:content", "media:thumbnail", "enclosure", "ht:news_item", "category"].includes(name),
});

/** Ambil teks dari node XML (string, {#text}, atau array). */
function text(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return text(v[0]);
  if (typeof v === "object") {
    const o = v as Node;
    if ("#text" in o) return text(o["#text"]);
  }
  return "";
}

/** Hapus tag HTML + rapikan spasi. Ringkasan feed sering berisi HTML. */
export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}

function parseDate(v: unknown): Date | null {
  const s = text(v).trim();
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/** URL gambar pertama dari <img src> di dalam HTML ringkasan. */
function firstImgInHtml(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function attr(v: unknown, name: string): string {
  if (Array.isArray(v)) return attr(v[0], name);
  if (v && typeof v === "object") return text((v as Node)[`@_${name}`]);
  return "";
}

function imageFrom(item: Node, rawSummary: string): string | null {
  const media = attr(item["media:content"], "url") || attr(item["media:thumbnail"], "url");
  if (media) return media;
  const enclosures = (item["enclosure"] as Node[] | undefined) ?? [];
  const img = enclosures.find((e) => text(e["@_type"]).startsWith("image/"));
  if (img) return text(img["@_url"]) || null;
  return firstImgInHtml(rawSummary);
}

function clip(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

function rssItem(item: Node): FeedItem | null {
  const title = stripHtml(text(item.title));
  const url = (text(item.link) || attr(item.link, "href") || text(item.guid)).trim();
  if (!title || !/^https?:\/\//i.test(url)) return null;
  const rawSummary = text(item["content:encoded"]) || text(item.description);
  const summary = stripHtml(rawSummary);
  return {
    title,
    url,
    summary: summary ? clip(summary, 1000) : null,
    imageUrl: imageFrom(item, rawSummary),
    author: stripHtml(text(item["dc:creator"]) || text(item.author)) || null,
    publishedAt: parseDate(item.pubDate ?? item["dc:date"]),
  };
}

function atomLink(entry: Node): string {
  const links = (entry.link as Node[] | undefined) ?? [];
  const alt =
    links.find((l) => !l["@_rel"] || text(l["@_rel"]) === "alternate") ?? links[0];
  return alt ? text(alt["@_href"]) : "";
}

function atomItem(entry: Node): FeedItem | null {
  const title = stripHtml(text(entry.title));
  const url = atomLink(entry).trim();
  if (!title || !/^https?:\/\//i.test(url)) return null;
  const rawSummary = text(entry.content) || text(entry.summary);
  const summary = stripHtml(rawSummary);
  const author = entry.author as Node | undefined;
  return {
    title,
    url,
    summary: summary ? clip(summary, 1000) : null,
    imageUrl: imageFrom(entry, rawSummary),
    author: author ? stripHtml(text(author.name)) || null : null,
    publishedAt: parseDate(entry.published ?? entry.updated),
  };
}

/**
 * Google Trends RSS: satu <item> = satu kata kunci tren, berisi beberapa
 * <ht:news_item>. Setiap berita terkait dijadikan item tersendiri, dengan
 * kata kunci tren dicatat di ringkasan.
 */
function trendsItems(item: Node): FeedItem[] {
  const keyword = stripHtml(text(item.title));
  const traffic = text(item["ht:approx_traffic"]);
  const picture = text(item["ht:picture"]) || null;
  const published = parseDate(item.pubDate);
  const news = (item["ht:news_item"] as Node[] | undefined) ?? [];
  return news
    .map((n): FeedItem | null => {
      const title = stripHtml(text(n["ht:news_item_title"]));
      const url = text(n["ht:news_item_url"]).trim();
      if (!title || !/^https?:\/\//i.test(url)) return null;
      const snippet = stripHtml(text(n["ht:news_item_snippet"]));
      const source = stripHtml(text(n["ht:news_item_source"]));
      const lead = `Tren Google: "${keyword}"${traffic ? ` (${traffic} penelusuran)` : ""}.`;
      return {
        title,
        url,
        summary: clip([lead, snippet].filter(Boolean).join(" "), 1000),
        imageUrl: text(n["ht:news_item_picture"]) || picture,
        author: source || null,
        publishedAt: published,
      };
    })
    .filter((x): x is FeedItem => x !== null);
}

/**
 * Parse XML feed menjadi daftar item. Melempar error bila bukan feed yang dikenali.
 */
export function parseFeed(xml: string): FeedItem[] {
  let doc: Node;
  try {
    doc = parser.parse(xml) as Node;
  } catch {
    throw new Error("XML tidak valid");
  }

  const rss = doc.rss as Node | undefined;
  if (rss) {
    const channel = (Array.isArray(rss.channel) ? rss.channel[0] : rss.channel) as Node | undefined;
    const items = (channel?.item as Node[] | undefined) ?? [];
    const isTrends = items.some((i) => i["ht:news_item"] !== undefined);
    if (isTrends) return items.flatMap(trendsItems);
    return items.map(rssItem).filter((x): x is FeedItem => x !== null);
  }

  const feed = doc.feed as Node | undefined;
  if (feed) {
    const entries = (feed.entry as Node[] | undefined) ?? [];
    return entries.map(atomItem).filter((x): x is FeedItem => x !== null);
  }

  const rdf = doc["rdf:RDF"] as Node | undefined;
  if (rdf) {
    const items = (rdf.item as Node[] | undefined) ?? [];
    return items.map(rssItem).filter((x): x is FeedItem => x !== null);
  }

  throw new Error("Bukan feed RSS/Atom yang dikenali");
}
