import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPublishedArticleBySlug } from "@/lib/articles";
import { renderArticleHtml } from "@/lib/render-content";
import { siteConfig } from "@/lib/site-config";
import { formatWibDate } from "@/lib/format";
import { ArticleReactions } from "@/components/public/article-reactions";

// Artikel diambil dari DB saat request → route blocking (Cache Components).
export const instant = false;

/**
 * Halaman Detail Artikel publik.
 * SEO: generateMetadata (title/desc/canonical/OG) + JSON-LD NewsArticle.
 * Catatan desain: high-fidelity detail artikel masih pending approval; ini
 * tata letak fungsional yang memakai token terkunci, belum design-freeze.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return { title: "Artikel tidak ditemukan" };

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
  if (!article) notFound();

  const html = renderArticleHtml(article.contentJson);
  const url = `${siteConfig.url}/artikel/${article.slug}`;

  // JSON-LD schema NewsArticle
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: [{ "@type": "Person", name: article.author.name }],
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
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
            className="text-sm font-semibold uppercase tracking-wide text-brand"
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

        <div
          className="prose-article mt-6 space-y-4 text-[length:var(--text-article-mobile)] leading-relaxed md:text-[length:var(--text-article-desktop)]"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Reaksi emote (wajib login) */}
        <div className="mt-8 border-t border-line pt-6">
          <ArticleReactions articleId={article.id} />
        </div>
      </div>
    </article>
  );
}
