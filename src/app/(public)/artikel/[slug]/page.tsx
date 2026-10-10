import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPublishedArticleBySlug } from "@/lib/articles";
import { renderArticleHtml } from "@/lib/render-content";
import { siteConfig } from "@/lib/site-config";
import { formatWibDate } from "@/lib/format";
import { ArticleReactions } from "@/components/public/article-reactions";
import { AdSlot } from "@/components/public/ad-slot";
import { CoverImage } from "@/components/public/cover-image";
import { sampleArticleDetail } from "@/lib/sample-content";

// Artikel diambil dari DB saat request → route blocking (Cache Components).
export const instant = false;

/**
 * Halaman Detail Artikel publik.
 * SEO: generateMetadata (title/desc/canonical/OG) + JSON-LD NewsArticle.
 * Catatan desain: high-fidelity detail artikel masih pending approval; ini
 * tata letak fungsional yang memakai token terkunci, belum design-freeze.
 *
 * Fallback preview: bila DB belum tersambung / artikel tak ditemukan tetapi
 * slug cocok dengan artikel contoh, tampilkan versi contoh beserta ad space.
 */

// Semua kartu contoh di homepage memakai slug "contoh-artikel-*".
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
      return {
        title: sampleArticleDetail.title,
        description: sampleArticleDetail.excerpt,
      };
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

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  // Fallback preview artikel contoh
  if (!article) {
    if (isSample(slug)) return <SampleArticle />;
    notFound();
  }

  const html = renderArticleHtml(article.contentJson);
  const url = `${siteConfig.url}/artikel/${article.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: [{ "@type": "Person", name: article.author.name }],
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: article.cover?.url ? [article.cover.url] : undefined,
  };

  return (
    <article className="container-jn py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl">
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
        <p className="mt-3 text-sm text-charcoal/60">
          {article.author.name}
          {article.publishedAt ? ` · ${formatWibDate(article.publishedAt.toISOString())} WIB` : ""}
          {article.region ? ` · ${article.region.name}` : ""}
        </p>

        {article.cover?.url && (
          <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-[var(--radius-card)]">
            <Image
              src={article.cover.url}
              alt={article.cover.alt || article.title}
              fill
              priority
              sizes="(min-width:768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        {/* Iklan after-cover / in-article (contoh posisi) */}
        <div className="my-6">
          <AdSlot placement="in-article" label="In-Article (Setelah Cover)" size="728×90" height={90} preview />
        </div>

        <div
          className="prose-article mt-6 space-y-4 text-[length:var(--text-article-mobile)] leading-relaxed md:text-[length:var(--text-article-desktop)]"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-8 border-t border-line pt-6">
          <ArticleReactions articleId={article.id} />
        </div>
      </div>
    </article>
  );
}

/**
 * SampleArticle — pratinjau Detail Artikel saat DB belum tersambung.
 * Menyertakan contoh posisi iklan: setelah cover + in-article (tengah badan).
 */
function SampleArticle() {
  const a = sampleArticleDetail;
  const half = Math.ceil(a.paragraphs.length / 2);
  const first = a.paragraphs.slice(0, half);
  const rest = a.paragraphs.slice(half);

  return (
    <article className="container-jn py-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/kategori/${a.category.slug}`}
          className="text-sm font-semibold uppercase tracking-wide text-brand hover:underline"
        >
          {a.category.name}
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-[length:var(--text-hero-desktop)]">
          {a.title}
        </h1>
        <p className="mt-3 text-sm text-charcoal/60">
          {a.authorName} · {formatWibDate(a.publishedAt)} WIB · {a.region.name}
        </p>

        {/* Cover (placeholder) */}
        <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-[var(--radius-card)]">
          <CoverImage article={{ image: null, title: a.title }} variant="card" />
        </div>

        {/* Iklan setelah cover */}
        <div className="my-6">
          <AdSlot placement="in-article" label="In-Article (Setelah Cover)" size="728×90" height={90} preview />
        </div>

        {/* Badan artikel + iklan in-article di tengah */}
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

        {/* Reaksi (wajib login) — di preview tanpa DB akan minta login saat diklik */}
        <div className="mt-8 border-t border-line pt-6">
          <ArticleReactions articleId={a.slug} />
        </div>

        <p className="mt-6 rounded-md bg-muted p-3 text-xs text-charcoal/50">
          Ini pratinjau artikel contoh (data belum dari database). Konten &amp;
          gambar nyata akan tampil setelah artikel dipublikasikan via CMS.
        </p>
      </div>
    </article>
  );
}
