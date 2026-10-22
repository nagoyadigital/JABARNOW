import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";
import { isTemplateKey, type BrandKit } from "@/lib/social/brand-kit";
import { parseSlides } from "@/lib/social/content";
import { loadPhoto } from "@/lib/social/photo";
import {
  BODY_FONT,
  HEADING_FONT,
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
  SlideView,
} from "@/lib/social/templates";

/**
 * Render satu slide paket sosmed → PNG 1080×1350.
 * Font brand & logo dibaca sekali dari src/assets (ikut ter-trace ke build
 * standalone lewat outputFileTracingIncludes di next.config.ts).
 */

const ASSETS = join(process.cwd(), "src", "assets");

let assetsPromise: Promise<{
  fonts: { name: string; data: Buffer; weight: 400 | 600 | 700 | 800; style: "normal" }[];
  logo: string;
}> | null = null;

function loadAssets() {
  assetsPromise ??= (async () => {
    const [jakartaBold, jakartaExtra, interRegular, interSemi, logo] = await Promise.all([
      readFile(join(ASSETS, "fonts", "PlusJakartaSans-Bold.ttf")),
      readFile(join(ASSETS, "fonts", "PlusJakartaSans-ExtraBold.ttf")),
      readFile(join(ASSETS, "fonts", "Inter-Regular.ttf")),
      readFile(join(ASSETS, "fonts", "Inter-SemiBold.ttf")),
      readFile(join(ASSETS, "brand", "logo-sosmed.png")),
    ]);
    return {
      fonts: [
        { name: HEADING_FONT, data: jakartaBold, weight: 700 as const, style: "normal" as const },
        { name: HEADING_FONT, data: jakartaExtra, weight: 800 as const, style: "normal" as const },
        { name: BODY_FONT, data: interRegular, weight: 400 as const, style: "normal" as const },
        { name: BODY_FONT, data: interSemi, weight: 600 as const, style: "normal" as const },
      ],
      logo: `data:image/png;base64,${logo.toString("base64")}`,
    };
  })().catch((err) => {
    assetsPromise = null; // coba lagi di permintaan berikutnya
    throw err;
  });
  return assetsPromise;
}

export type RenderablePost = {
  template: string;
  kicker: string | null;
  headline: string;
  highlight: string | null;
  slides: unknown;
  imageUrl: string | null;
};

export async function renderSlide(
  post: RenderablePost,
  index: number,
  kit: Pick<BrandKit, "handle">,
  headers?: Record<string, string>,
): Promise<ImageResponse | null> {
  const slides = parseSlides(post.slides);
  const slide = slides.at(index);
  if (!slide) return null;

  const [{ fonts, logo }, photo] = await Promise.all([
    loadAssets(),
    // Foto hanya dipakai di slide cover
    slide.kind === "cover" ? loadPhoto(post.imageUrl) : Promise.resolve(null),
  ]);

  return new ImageResponse(
    (
      <SlideView
        template={isTemplateKey(post.template) ? post.template : "kotak-putih"}
        slide={slide.kind === "cover" ? { ...slide, title: post.headline } : slide}
        index={index}
        total={slides.length}
        headline={post.headline}
        kicker={post.kicker}
        highlight={post.highlight}
        photo={photo}
        logo={logo}
        handle={kit.handle}
        site={siteConfig.url.replace(/^https?:\/\//, "").replace(/\/+$/, "")}
      />
    ),
    { width: SLIDE_WIDTH, height: SLIDE_HEIGHT, fonts, headers },
  );
}
