import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFeed } from "@/lib/ai/feed-parser";

test("RSS 2.0: judul, ringkasan bersih, gambar, penulis, tanggal", () => {
  const xml = `<?xml version="1.0"?><rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel>
  <item><title><![CDATA[Banjir Rendam Bandung &amp; Warga Mengungsi]]></title><link>https://ex.com/a/1?utm_source=rss</link>
  <description><![CDATA[<p>Hujan <b>deras</b>.</p><img src="https://ex.com/i.jpg">]]></description>
  <pubDate>Thu, 22 Oct 2026 10:00:00 +0700</pubDate><dc:creator>Asep</dc:creator></item>
  <item><title>2026</title><link>https://ex.com/a/2</link><media:content url="https://ex.com/m.jpg"/></item>
  <item><title>Tanpa tautan</title></item></channel></rss>`;
  const r = parseFeed(xml);
  assert.equal(r.length, 2);
  assert.equal(r[0].title, "Banjir Rendam Bandung & Warga Mengungsi");
  assert.equal(r[0].summary, "Hujan deras.");
  assert.equal(r[0].imageUrl, "https://ex.com/i.jpg");
  assert.equal(r[0].author, "Asep");
  assert.equal(r[0].publishedAt?.toISOString(), "2026-10-22T03:00:00.000Z");
  assert.equal(r[1].title, "2026", "judul angka tetap string");
  assert.equal(r[1].imageUrl, "https://ex.com/m.jpg");
});

test("Atom: link alternate & author", () => {
  const xml = `<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Atom satu</title>
  <link rel="alternate" href="https://ex.com/atom1"/><link rel="self" href="https://ex.com/self"/>
  <updated>2026-10-22T01:00:00Z</updated><author><name>Budi</name></author></entry></feed>`;
  const [a] = parseFeed(xml);
  assert.equal(a.url, "https://ex.com/atom1");
  assert.equal(a.author, "Budi");
});

test("Google Trends: tiap berita terkait jadi satu item", () => {
  const xml = `<rss xmlns:ht="https://trends.google.com/trending/rss" version="2.0"><channel><item>
  <title>persib</title><ht:approx_traffic>10000+</ht:approx_traffic><ht:picture>https://p/x.jpg</ht:picture>
  <ht:news_item><ht:news_item_title>Persib Menang</ht:news_item_title><ht:news_item_url>https://n/1</ht:news_item_url></ht:news_item>
  <ht:news_item><ht:news_item_title>Bobotoh Rayakan</ht:news_item_title><ht:news_item_url>https://n/2</ht:news_item_url></ht:news_item>
  </item></channel></rss>`;
  const r = parseFeed(xml);
  assert.equal(r.length, 2);
  assert.match(r[0].summary ?? "", /^Tren Google: "persib" \(10000\+ penelusuran\)/);
  assert.equal(r[1].imageUrl, "https://p/x.jpg");
});

test("Bukan feed → error", () => {
  assert.throws(() => parseFeed("<html><body>hi</body></html>"));
});
