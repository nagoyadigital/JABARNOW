import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { SocialPostStatus } from "@prisma/client";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import {
  getBrandKitWithVersion,
  isTemplateKey,
  TEMPLATE_KEYS,
  TEMPLATE_LABELS,
} from "@/lib/social/brand-kit";
import { parseSlides } from "@/lib/social/content";
import { renderVersion, slideImagePath } from "@/lib/social/sign";
import {
  GeneratePackageButton,
  SlidePreview,
  SocialDecisionPanel,
  SocialPostEditor,
} from "@/components/cms/sosmed-controls";

export const instant = false;

/**
 * Studio Sosmed — detail satu konten: pratinjau slide, editor, keputusan.
 */

const STATUS_LABEL: Record<SocialPostStatus, string> = {
  PENDING_REVIEW: "Perlu review",
  APPROVED: "Disetujui",
  SCHEDULED: "Terjadwal",
  POSTED: "Sudah tayang",
  FAILED: "Gagal posting",
  REJECTED: "Ditolak",
};

export default async function SosmedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const session = await requirePermission("social.manage");
  const canApprove = hasPermission(session.user.role, "social.approve");
  const { id } = await params;

  const [post, { version }] = await Promise.all([
    prisma.socialPost.findUnique({
      where: { id },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            ogImageUrl: true,
            cover: { select: { url: true } },
            socialPosts: { select: { id: true, format: true } },
          },
        },
      },
    }),
    getBrandKitWithVersion(),
  ]);
  if (!post) notFound();

  const slides = parseSlides(post.slides);
  const v = renderVersion(post.updatedAt, version);
  const images = slides.map((_, i) => slideImagePath(post.id, i, v));
  const sibling = post.article.socialPosts.find((p) => p.id !== post.id);
  const readOnly = post.status === "SCHEDULED" || post.status === "POSTED";
  const photoSource = post.article.cover?.url ?? post.article.ogImageUrl ?? null;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/cms/sosmed" className="text-xs text-charcoal/50 hover:text-brand">
            ← Antrian Sosmed
          </Link>
          <h1 className="mt-1 text-xl font-semibold">
            {post.format === "SINGLE" ? "Feed 1 slide" : `Carousel ${slides.length} slide`}
          </h1>
          <p className="mt-1 truncate text-sm text-charcoal/60">
            Dari artikel:{" "}
            <Link href={`/cms/artikel/${post.article.id}`} className="font-medium hover:text-brand">
              {post.article.title}
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-brand/10 px-2 py-1 text-xs font-semibold text-brand">
            {STATUS_LABEL[post.status]}
          </span>
          <span className="rounded bg-muted px-2 py-1 text-xs text-charcoal/60">
            {post.generatedBy.startsWith("ai") ? `AI · ${post.generatedBy.slice(3)}` : "Template otomatis"}
          </span>
          {sibling && (
            <Link
              href={`/cms/sosmed/${sibling.id}`}
              className="rounded-md border border-line px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              Lihat versi {sibling.format === "SINGLE" ? "feed" : "carousel"}
            </Link>
          )}
          {!readOnly && (
            <GeneratePackageButton articleId={post.article.id} force label="Tulis ulang semua" />
          )}
        </div>
      </div>

      {post.status === "REJECTED" && post.reviewNote && (
        <p className="rounded-md bg-breaking/10 px-3 py-2 text-sm text-breaking">
          Ditolak: {post.reviewNote}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="space-y-4">
          <SlidePreview images={images} name={`jabarnow-${post.article.slug.slice(0, 40)}`} />
          {canApprove ? (
            <SocialDecisionPanel id={post.id} status={post.status} />
          ) : (
            post.status === "PENDING_REVIEW" && (
              <p className="rounded-md bg-muted px-3 py-2 text-xs text-charcoal/60">
                Menunggu keputusan Pemimpin Redaksi.
              </p>
            )
          )}
          <p className="text-xs text-charcoal/50">
            Posting otomatis ke Instagram, TikTok, Threads, dan Facebook menyusul di tahap penjadwalan.
            Sementara ini konten yang disetujui bisa diunduh dan caption-nya disalin.
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-line bg-base p-5">
          <SocialPostEditor
            id={post.id}
            format={post.format}
            readOnly={readOnly}
            templates={TEMPLATE_KEYS.map((key) => ({ key, ...TEMPLATE_LABELS[key] }))}
            initial={{
              template: isTemplateKey(post.template) ? post.template : "kotak-putih",
              kicker: post.kicker ?? "",
              headline: post.headline,
              headlineAlts: post.headlineAlts,
              highlight: post.highlight ?? "",
              slides,
              caption: post.caption,
              hashtags: post.hashtags,
              usePhoto: Boolean(post.imageUrl),
              hasPhoto: Boolean(photoSource),
            }}
          />
        </div>
      </div>
    </div>
  );
}
