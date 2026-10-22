import { prisma } from "@/lib/prisma";
import { scoutConfig } from "@/lib/ai/config";
import { fetchText, extractOgImage } from "@/lib/ai/http";
import { parseFeed, type FeedItem } from "@/lib/ai/feed-parser";
import { canonicalUrl, titleKey } from "@/lib/ai/normalize";
import { finishRun, startRun } from "@/lib/ai/agent-run";

/**
 * Scout — agent pemantau sumber berita (tanpa AI, biaya nol).
 *
 * Alur per putaran:
 *  1. Ambil semua NewsSource aktif (paralel terbatas).
 *  2. Parse RSS/Atom/Trends → buang item terlalu lama.
 *  3. Dedup: URL kanonik (unik di DB) + judul ternormalisasi (lintas portal).
 *  4. Simpan sebagai Topic status NEW, perbarui statistik sumber.
 *  5. Lengkapi gambar (og:image) untuk topik baru yang belum punya gambar.
 */

export type SourceResult = {
  sourceId: string;
  name: string;
  fetched: number;
  created: number;
  error?: string;
};

export type ScoutResult = {
  runId: string;
  sources: SourceResult[];
  created: number;
  failed: number;
};

type Fetched = {
  source: { id: string; name: string; url: string; language: string };
  items: FeedItem[];
  error?: string;
};

async function fetchSource(source: Fetched["source"]): Promise<Fetched> {
  try {
    const xml = await fetchText(source.url, {
      timeoutMs: scoutConfig.fetchTimeoutMs,
      maxBytes: scoutConfig.maxFeedBytes,
    });
    const items = parseFeed(xml).slice(0, scoutConfig.maxItemsPerSource);
    return { source, items };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { source, items: [], error: message.slice(0, 300) };
  }
}

/** Jalankan fn untuk tiap elemen dengan batas paralel. */
async function mapLimit<T, R>(list: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(list.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, list.length) }, async () => {
    while (next < list.length) {
      const i = next++;
      out[i] = await fn(list[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

export async function runScout(opts: {
  trigger: string;
  sourceIds?: string[];
}): Promise<ScoutResult> {
  const run = await startRun("SCOUT", opts.trigger);

  try {
    const sources = await prisma.newsSource.findMany({
      where: {
        isActive: true,
        ...(opts.sourceIds?.length ? { id: { in: opts.sourceIds } } : {}),
      },
      select: { id: true, name: true, url: true, language: true },
      orderBy: { createdAt: "asc" },
    });

    const fetched = await mapLimit(sources, scoutConfig.concurrency, fetchSource);

    const now = Date.now();
    const minPublished = now - scoutConfig.maxAgeHours * 3600_000;
    const dedupSince = new Date(now - scoutConfig.titleDedupHours * 3600_000);

    // Kunci judul yang sudah ada di jendela dedup (lintas portal)
    const seenTitles = new Set(
      (
        await prisma.topic.findMany({
          where: { createdAt: { gte: dedupSince } },
          select: { titleKey: true },
        })
      ).map((t) => t.titleKey),
    );
    const seenUrls = new Set<string>();

    const results: SourceResult[] = [];
    const newTopicIds: string[] = [];

    // Simpan berurutan agar dedup judul antar-sumber dalam satu putaran konsisten
    for (const f of fetched) {
      if (f.error) {
        await prisma.newsSource.update({
          where: { id: f.source.id },
          data: { lastCheckedAt: new Date(), lastError: f.error, lastNewCount: 0 },
        });
        results.push({ sourceId: f.source.id, name: f.source.name, fetched: 0, created: 0, error: f.error });
        continue;
      }

      const candidates = f.items
        .filter((i) => !i.publishedAt || i.publishedAt.getTime() >= minPublished)
        .map((i) => ({ ...i, url: canonicalUrl(i.url), titleKey: titleKey(i.title) }))
        .filter((i) => i.titleKey && !seenUrls.has(i.url) && !seenTitles.has(i.titleKey));

      const existing = new Set(
        (
          await prisma.topic.findMany({
            where: { url: { in: candidates.map((c) => c.url) } },
            select: { url: true },
          })
        ).map((t) => t.url),
      );

      let created = 0;
      for (const c of candidates) {
        if (existing.has(c.url) || seenUrls.has(c.url) || seenTitles.has(c.titleKey)) continue;
        seenUrls.add(c.url);
        seenTitles.add(c.titleKey);
        try {
          const topic = await prisma.topic.create({
            data: {
              sourceId: f.source.id,
              url: c.url,
              titleKey: c.titleKey,
              title: c.title.slice(0, 500),
              summary: c.summary,
              imageUrl: c.imageUrl,
              author: c.author?.slice(0, 200) ?? null,
              publishedAt: c.publishedAt,
              language: f.source.language,
            },
            select: { id: true, imageUrl: true },
          });
          created += 1;
          if (!topic.imageUrl) newTopicIds.push(topic.id);
        } catch {
          // Bentrok unik (proses paralel lain sudah menyimpan URL ini) → lewati
        }
      }

      await prisma.newsSource.update({
        where: { id: f.source.id },
        data: { lastCheckedAt: new Date(), lastError: null, lastNewCount: created },
      });
      results.push({ sourceId: f.source.id, name: f.source.name, fetched: f.items.length, created });
    }

    await enrichImages(newTopicIds.slice(0, scoutConfig.ogImageLimit));

    const createdTotal = results.reduce((n, r) => n + r.created, 0);
    const failed = results.filter((r) => r.error).length;
    await finishRun(run.id, {
      status: "OK",
      items: createdTotal,
      summary: `${sources.length} sumber dicek, ${createdTotal} topik baru${failed ? `, ${failed} sumber gagal` : ""}`,
    });
    return { runId: run.id, sources: results, created: createdTotal, failed };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await finishRun(run.id, { status: "ERROR", error: message.slice(0, 500) });
    throw err;
  }
}

/** Ambil og:image dari halaman artikel untuk topik tanpa gambar. Best-effort. */
async function enrichImages(topicIds: string[]): Promise<void> {
  if (topicIds.length === 0) return;
  const topics = await prisma.topic.findMany({
    where: { id: { in: topicIds } },
    select: { id: true, url: true },
  });
  await mapLimit(topics, scoutConfig.concurrency, async (t) => {
    try {
      const html = await fetchText(t.url, {
        timeoutMs: 8000,
        maxBytes: 256 * 1024,
        accept: "text/html,application/xhtml+xml",
      });
      const img = extractOgImage(html);
      if (img) await prisma.topic.update({ where: { id: t.id }, data: { imageUrl: img } });
    } catch {
      /* gambar opsional — abaikan kegagalan */
    }
  });
}

/** Uji satu URL feed tanpa menyimpan apa pun (dipakai tombol "Cek feed"). */
export async function testFeed(url: string): Promise<{ ok: boolean; count: number; sample: string[]; error?: string }> {
  try {
    const xml = await fetchText(url, {
      timeoutMs: scoutConfig.fetchTimeoutMs,
      maxBytes: scoutConfig.maxFeedBytes,
    });
    const items = parseFeed(xml);
    return { ok: true, count: items.length, sample: items.slice(0, 3).map((i) => i.title) };
  } catch (err) {
    return { ok: false, count: 0, sample: [], error: err instanceof Error ? err.message : String(err) };
  }
}
