import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPublishedArticleBySlug, getRelatedArticles } from "@/lib/articles";
import { renderArticleHtml } from "@/lib/render-content";
import { siteConfig } from "@/lib/site-config";
import { formatWibDateTime, readingTimeMinutes } from "@/lib/format";
import { ArticleReactions } from "@/components/public/article-reactions";
import { AdSlot } from "@/components/public/ad-slot";
import { CoverImage } from "@/components/public/cover-image";
import { ShareBar } from "@/components/public/share-bar";
import { AuthorCard } from "@/components/public/author-card";
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

function isSample(slug: string) {
  return slug.startsWith("contoh-artikel");
}

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
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Shell layout bersama (konten kiri + sidebar kanan). */
function ArticleShell({
  children,
  jsonLd,
}: {
  children: React.ReactNode;
  jsonLd?: object;
}) {
  return (
    <div className="container-jn py-8">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="grid gap-8 lg:grid-cols-12">
        <article className="lg:col-span-8">
          <div className="mx-auto max-w-3xl">{children}</div>
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <div className="space-y-6 lg:sticky lg:top-4">
            <AdSlot
              placement="sidebar"
              label="Sidebar (Medium Rectangle)"
              size="300×250"
              height={250}
              preview
            />
            <MostRead data24h={mostRead24h} data7d={mostRead7d} />
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
  const [related, commentsOn] = await Promise.all([
    getRelatedArticles(article.slug, article.category?.slug),
    areCommentsEnabled(),
  ]);
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
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: article.cover?.url ? [article.cover.url] : undefined,
  };

  return (
    <ArticleShell jsonLd={jsonLd}>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          ...(article.category
            ? [{ label: article.category.name, href: `/kategori/${article.category.slug}` }]
            : []),
          { label: article.title },
        ]}
      />
      {article.category && (
        <Link
          href={`/kategori/${article.category.slug}`}
          className="text-sm font-semibold uppercase tracking-wide text-brand hover:underline"
        >
          {article.category.name}
        </Link>
      )}
      <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-[length:var(--text-hero-desktop)]">
        {article.title}
      </h1>

      {/* Byline: penulis · tanggal+jam WIB · waktu baca · wilayah */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
        <p className="text-sm text-charcoal/60">
          <span className="font-medium text-charcoal">{article.author.name}</span>
          {publishedIso ? ` · ${formatWibDateTime(publishedIso)}` : ""}
          {` · ${readMin} menit baca`}
          {article.region ? ` · ${article.region.name}` : ""}
        </p>
        <ShareBar title={article.title} />
      </div>

      {article.cover?.url && (
        <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-[var(--radius-card)]">
          <Image
            src={article.cover.url}
            alt={article.cover.alt || article.title}
            fill
            priority
            sizes="(min-width:1024px) 66vw, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="my-6">
        <AdSlot placement="in-article" label="In-Article (Setelah Cover)" size="728×90" height={90} preview />
      </div>

      <div
        className="prose-article space-y-4 text-[length:var(--text-article-mobile)] leading-relaxed md:text-[length:var(--text-article-desktop)]"
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

      {/* Author (satu kali) */}
      <div className="mt-6">
        <AuthorCard name={article.author.name} />
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
    <ArticleShell>
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
