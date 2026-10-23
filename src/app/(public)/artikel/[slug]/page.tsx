import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { after } from "next/server";
import Image from "next/image";
import Link from "next/link";
import {
  cardToArticle,
  getPublishedArticleBySlug,
  getRelatedArticles,
  incrementArticleView,
  listMostRead,
} from "@/lib/articles";
import { absoluteUrl, breadcrumbLd, jsonLdString, publisherLd } from "@/lib/seo";
import { DEMO_CONTENT } from "@/lib/demo";
import type { Article } from "@/lib/types";
import { renderArticleHtml } from "@/lib/render-content";
import { siteConfig } from "@/lib/site-config";
import { BookOpenIcon, ClockIcon, MapPinIcon } from "@/components/common/icons";
import { formatWibDateTime, readingTimeMinutes } from "@/lib/format";
import { ArticleReactions } from "@/components/public/article-reactions";
import { AdSlot } from "@/components/public/ad-slot";
import { CoverImage } from "@/components/public/cover-image";
import { ShareBar } from "@/components/public/share-bar";
import { AuthorCard } from "@/components/public/author-card";
import { MoreInCategory } from "@/components/public/more-in-category";
import { ROLE_LABELS } from "@/lib/permissions";
import { Breadcrumb } from "@/components/public/breadcrumb";
import { TagChips } from "@/components/public/tag-chips";
import { Comments } from "@/components/public/comments";
import { ArticleArchiveList } from "@/components/public/article-list";
import { SectionHeading } from "@/components/public/section-heading";
import { MostRead } from "@/components/public/most-read";
import { getApprovedComments } from "@/app/(public)/artikel/comment-actions";
import { areCommentsEnabled } from "@/lib/settings";
import { sampleArticleDetail, mostRead24h, mostRead7d } from "@/lib/sample-content";

export const instant = false;

/**
 * Halaman Detail Artikel publik — layout 2 kolom (konten + sidebar).
 * Konten: byline (penulis, tanggal+jam WIB), share sosial, cover, badan,
 * ad in-article, author card, reaksi. Sidebar: iklan + Most Read (sticky).
 */

/** Artikel contoh hanya bisa dibuka di mode demo (development). */
function isSample(slug: string) {
  return DEMO_CONTENT && slug.startsWith("contoh-artikel");
}

/** Bot/crawler/preview link tidak dihitung sebagai pembaca. */
const NON_HUMAN_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|lighthouse|headless/i;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    if (isSample(slug)) {
      return { title: sampleArticleDetail.title, description: sampleArticleDetail.excerpt };
    }
    return { title: "Artikel tidak ditemukan" };
  }

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt || siteConfig.description;
  const url = `${siteConfig.url}/artikel/${article.slug}`;
  const image = article.ogImageUrl || article.cover?.url;

  return {
    title,
    description,
    alternates: { canonical: article.canonicalUrl || url },
    robots: article.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      url,
      title,
      description,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      section: article.category?.name,
      tags: article.tags.map((t) => t.tag.name),
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

/** Shell layout bersama (konten kiri + sidebar kanan). */
function ArticleShell({
  children,
  jsonLd = [],
  mostRead24h,
  mostRead7d,
  sidebarTop,
  sidebarMore,
}: {
  children: React.ReactNode;
  jsonLd?: object[];
  mostRead24h: Article[];
  mostRead7d: Article[];
  /** Paling atas kolom kanan (kartu penulis). */
  sidebarTop?: React.ReactNode;
  /** Setelah iklan pertama (Lainnya di Kategori). */
  sidebarMore?: React.ReactNode;
}) {
  return (
    <div className="container-jn py-8">
      {jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          // jsonLdString meng-escape "<" dkk. agar judul tidak bisa menutup tag script
          dangerouslySetInnerHTML={{ __html: jsonLdString(ld) }}
        />
      ))}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* min-w-0: judul panjang (truncate) di breadcrumb tak boleh melebarkan kolom */}
        <article className="min-w-0 lg:col-span-8">
          <div className="mx-auto max-w-3xl">{children}</div>
        </article>

        {/* Sidebar */}
        <aside className="min-w-0 lg:col-span-4">
          <div className="space-y-8">
            {sidebarTop}
            <AdSlot
              placement="sidebar"
              label="Sidebar (Medium Rectangle)"
              size="300×250"
              height={250}
              preview
            />
            {sidebarMore}
            {mostRead24h.length + mostRead7d.length > 0 && (
              <MostRead data24h={mostRead24h} data7d={mostRead7d} />
            )}
            <AdSlot
              placement="sidebar"
              label="Sidebar (Half Page)"
              size="300×600"
              height={320}
              preview
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    if (isSample(slug)) return <SampleArticle />;
    notFound();
  }

  const html = renderArticleHtml(article.contentJson);
  const url = `${siteConfig.url}/artikel/${article.slug}`;
  const publishedIso = article.publishedAt?.toISOString();
  const [related, moreInCategory, commentsOn, read24, read7, reqHeaders] = await Promise.all([
    getRelatedArticles(article.slug, article.category?.slug),
    article.category ? getRelatedArticles(article.slug, article.category.slug, 5) : Promise.resolve([]),
    areCommentsEnabled(),
    listMostRead(24, 5),
    listMostRead(24 * 7, 5),
    headers(),
  ]);
  // Hitung pembaca setelah respons terkirim (tidak memperlambat halaman)
  if (!NON_HUMAN_UA.test(reqHeaders.get("user-agent") ?? "")) {
    after(() => incrementArticleView(article.slug));
  }
  const comments = commentsOn ? await getApprovedComments(article.id) : [];
  // Perkiraan waktu baca dari teks konten (strip tag)
  const readMin = readingTimeMinutes(html.replace(/<[^>]+>/g, " "));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || undefined,
    datePublished: publishedIso,
    dateModified: article.updatedAt.toISOString(),
    author: [{ "@type": "Person", name: article.author.name }],
    publisher: publisherLd(),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: [article.ogImageUrl || article.cover?.url || absoluteUrl("/opengraph-image")],
    inLanguage: "id-ID",
    articleSection: article.category?.name,
    keywords: article.tags.map((t) => t.tag.name).join(", ") || undefined,
    contentLocation: article.region
      ? { "@type": "Place", name: `${article.region.name}, Jawa Barat` }
      : undefined,
  };
  const crumbs = breadcrumbLd([
    { name: "Beranda", path: "/" },
    ...(article.category
      ? [{ name: article.category.name, path: `/kategori/${article.category.slug}` }]
      : []),
    { name: article.title, path: `/artikel/${article.slug}` },
  ]);

  return (
    <ArticleShell
      jsonLd={[jsonLd, crumbs]}
      mostRead24h={read24.map(cardToArticle)}
      mostRead7d={read7.map(cardToArticle)}
      sidebarTop={<AuthorCard name={article.author.name} roleLabel={ROLE_LABELS[article.author.role]} />}
      sidebarMore={
        article.category && (
          <MoreInCategory
            categoryName={article.category.name}
            categorySlug={article.category.slug}
            articles={moreInCategory.map(cardToArticle)}
          />
        )
      }
    >
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          ...(article.category
            ? [{ label: article.category.name, href: `/kategori/${article.category.slug}` }]
            : []),
          { label: article.title },
        ]}
      />
      <h1 className="text-[32px] font-extrabold leading-[1.15] tracking-tight md:text-[length:var(--text-hero-desktop)]">
        {article.title}
      </h1>

      {/* Byline: avatar · penulis + label · tanggal+jam WIB · waktu baca · wilayah */}
      <div className="mt-6 flex items-center gap-3 border-b border-line pb-6">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-breaking to-brand text-xl font-bold text-white shadow-md"
        >
          {article.author.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-semibold">
            {article.author.name}
            <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
              {ROLE_LABELS[article.author.role]}
            </span>
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-charcoal/50">
            {publishedIso && (
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5" />
                {formatWibDateTime(publishedIso)}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <BookOpenIcon className="h-3.5 w-3.5" />
              {readMin} menit baca
            </span>
            {article.region && (
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="h-3.5 w-3.5" />
                {article.region.name}
              </span>
            )}
          </p>
        </div>
      </div>

      {article.cover?.url && (
        <figure className="mt-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl shadow-[0_8px_24px_-16px_rgba(23,25,29,0.4)]">
            <Image
              src={article.cover.url}
              alt={article.cover.alt || article.title}
              fill
              priority
              sizes="(min-width:1024px) 66vw, 100vw"
              className="object-cover"
            />
          </div>
          {(article.cover.caption || article.cover.credit) && (
            <figcaption className="mt-3 text-center text-xs italic text-charcoal/50">
              {[article.cover.caption, article.cover.credit && `Sumber: ${article.cover.credit}`]
                .filter(Boolean)
                .join(", ")}
            </figcaption>
          )}
        </figure>
      )}

      {/* Baris bagikan di bawah foto, dibatasi garis tipis */}
      <div className="mt-6 flex justify-end border-y border-line py-3">
        <ShareBar title={article.title} />
      </div>

      <div className="my-6">
        <AdSlot placement="in-article" label="In-Article (Setelah Cover)" size="728×90" height={90} preview />
      </div>

      <div
        className="prose-article space-y-6 text-[length:var(--text-article-mobile)] leading-[1.8] md:text-justify md:text-[length:var(--text-article-desktop)] md:leading-[1.85]"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Tag artikel */}
      {article.tags.length > 0 && (
        <div className="mt-6">
          <TagChips
            tags={article.tags.map((t) => ({ slug: t.tag.slug, name: t.tag.name }))}
          />
        </div>
      )}

      {/* Reaksi emote (selalu aktif, wajib login) */}
      <div className="mt-8 border-t border-line pt-6">
        <ArticleReactions articleId={article.id} />
      </div>


      {related.length > 0 && (
        <div className="mt-10">
          <SectionHeading title="Artikel Terkait" />
          <ArticleArchiveList items={related} />
        </div>
      )}

      {/* Komentar hanya bila diaktifkan via CMS Website Settings */}
      {commentsOn && (
        <Comments
          articleId={article.id}
          initialComments={comments.map((c) => ({
            ...c,
            createdAt: c.createdAt.toISOString(),
          }))}
        />
      )}
    </ArticleShell>
  );
}

/** Pratinjau Detail Artikel saat DB belum tersambung. */
function SampleArticle() {
  const a = sampleArticleDetail;
  const half = Math.ceil(a.paragraphs.length / 2);
  const first = a.paragraphs.slice(0, half);
  const rest = a.paragraphs.slice(half);

  const readMin = readingTimeMinutes(a.paragraphs.join(" "));
  return (
    <ArticleShell mostRead24h={mostRead24h} mostRead7d={mostRead7d}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: a.category.name, href: `/kategori/${a.category.slug}` },
          { label: a.title },
        ]}
      />
      <Link
        href={`/kategori/${a.category.slug}`}
        className="text-sm font-semibold uppercase tracking-wide text-brand hover:underline"
      >
        {a.category.name}
      </Link>
      <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-[length:var(--text-hero-desktop)]">
        {a.title}
      </h1>

      {/* Byline + share */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
        <p className="text-sm text-charcoal/60">
          <span className="font-medium text-charcoal">{a.authorName}</span>
          {` · ${formatWibDateTime(a.publishedAt)} · ${readMin} menit baca · ${a.region.name}`}
        </p>
        <ShareBar title={a.title} />
      </div>

      {/* Cover placeholder */}
      <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-[var(--radius-card)]">
        <CoverImage article={{ image: null, title: a.title }} variant="card" />
      </div>

      {/* Iklan setelah cover */}
      <div className="my-6">
        <AdSlot placement="in-article" label="In-Article (Setelah Cover)" size="728×90" height={90} preview />
      </div>

      {/* Badan + iklan in-article di tengah */}
      <div className="prose-article space-y-4 text-[length:var(--text-article-mobile)] leading-relaxed md:text-[length:var(--text-article-desktop)]">
        {first.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="my-6">
        <AdSlot placement="in-article" label="In-Article (Tengah Artikel)" size="300×250" height={250} preview />
      </div>

      <div className="prose-article space-y-4 text-[length:var(--text-article-mobile)] leading-relaxed md:text-[length:var(--text-article-desktop)]">
        {rest.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* Reaksi emote (selalu aktif) */}
      <div className="mt-8 border-t border-line pt-6">
        <ArticleReactions articleId={a.slug} />
      </div>

      {/* Author (satu kali) */}
      <div className="mt-6">
        <AuthorCard name={a.authorName} />
      </div>

      <p className="mt-6 rounded-md bg-muted p-3 text-xs text-charcoal/50">
        Ini pratinjau artikel contoh (data belum dari database). Konten &amp;
        gambar nyata akan tampil setelah artikel dipublikasikan via CMS.
      </p>
    </ArticleShell>
  );
}
