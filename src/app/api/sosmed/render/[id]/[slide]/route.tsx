import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBrandKit } from "@/lib/social/brand-kit";
import { renderSlide } from "@/lib/social/render";
import { verifySlideSignature } from "@/lib/social/sign";

/**
 * GET /api/sosmed/render/:id/:slide?v=<versi>&s=<tanda tangan>[&dl=1]
 * PNG 1080×1350 satu slide paket sosmed. Tanpa login (dibutuhkan platform
 * sosmed saat posting), dilindungi tanda tangan HMAC per post/slide/versi.
 */

export const maxDuration = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; slide: string }> },
) {
  const { id, slide } = await params;
  const index = Number(slide);
  const v = req.nextUrl.searchParams.get("v") ?? "";
  const s = req.nextUrl.searchParams.get("s") ?? "";
  if (!Number.isInteger(index) || index < 0 || index > 20 || !verifySlideSignature(id, index, v, s)) {
    return NextResponse.json({ error: "Tidak valid" }, { status: 403 });
  }

  try {
    const [post, kit] = await Promise.all([
      prisma.socialPost.findUnique({
        where: { id },
        select: {
          template: true,
          kicker: true,
          headline: true,
          highlight: true,
          slides: true,
          imageUrl: true,
          format: true,
          article: { select: { slug: true } },
        },
      }),
      getBrandKit(),
    ]);
    if (!post) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

    const download = req.nextUrl.searchParams.get("dl") === "1";
    const name = `jabarnow-${post.article.slug.slice(0, 50)}-${post.format === "SINGLE" ? "feed" : "carousel"}-${index + 1}.png`;
    const image = await renderSlide(post, index, kit, {
      // Versi ada di URL → aman di-cache lama
      "Cache-Control": "public, max-age=31536000, immutable",
      ...(download ? { "Content-Disposition": `attachment; filename="${name}"` } : {}),
    });
    if (!image) return NextResponse.json({ error: "Slide tidak ada" }, { status: 404 });
    return image;
  } catch (err) {
    console.error("render sosmed:", err);
    return NextResponse.json({ error: "Gagal merender" }, { status: 500 });
  }
}
