/* eslint-disable @next/next/no-img-element -- Satori (next/og) hanya mengenal <img> biasa */
import type { ReactElement } from "react";
import type { TemplateKey } from "@/lib/social/brand-kit";
import type { Slide } from "@/lib/social/content";

/**
 * Template visual Studio Sosmed (Satori / next/og: hanya flexbox + subset CSS).
 * Ukuran feed Instagram 4:5 → 1080 × 1350. Warna mengikuti design token JabarNow.
 */

export const SLIDE_WIDTH = 1080;
export const SLIDE_HEIGHT = 1350;

const C = {
  brand: "#f4511e",
  breaking: "#c62828",
  charcoal: "#17191d",
  base: "#ffffff",
  muted: "#f7f8fa",
  line: "#e5e7eb",
};

export const HEADING_FONT = "Plus Jakarta Sans";
export const BODY_FONT = "Inter";

export type SlideRenderInput = {
  template: TemplateKey;
  slide: Slide;
  index: number;
  total: number;
  headline: string;
  kicker: string | null;
  highlight: string | null;
  photo: string | null; // data URI
  logo: string; // data URI
  handle: string;
  site: string; // "jabarnow.id"
};

/** Ukuran font headline menyesuaikan panjang teks agar selalu muat. */
function headlineSize(text: string, base: number): number {
  const n = text.length;
  if (n <= 40) return base;
  if (n <= 60) return Math.round(base * 0.88);
  if (n <= 80) return Math.round(base * 0.78);
  if (n <= 100) return Math.round(base * 0.7);
  return Math.round(base * 0.62);
}

/** Pecah headline per kata; kata yang termasuk frasa sorotan diberi warna aksen. */
function Headline({
  text,
  highlight,
  color,
  accent,
  size,
  upper,
}: {
  text: string;
  highlight: string | null;
  color: string;
  accent: string;
  size: number;
  upper?: boolean;
}) {
  const shown = upper ? text.toUpperCase() : text;
  const lower = text.toLowerCase();
  const hl = highlight?.trim().toLowerCase();
  const start = hl ? lower.indexOf(hl) : -1;
  const end = start >= 0 && hl ? start + hl.length : -1;

  const words: { w: string; on: boolean }[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(shown))) {
    const s = m.index;
    const e = s + m[0].length;
    words.push({ w: m[0], on: start >= 0 && s < end && e > start });
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        fontFamily: HEADING_FONT,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: upper ? -1 : -1.5,
        color,
      }}
    >
      {words.map((x, i) => (
        <span key={i} style={{ color: x.on ? accent : color, marginRight: size * 0.24 }}>
          {x.w}
        </span>
      ))}
    </div>
  );
}

function PhotoLayer({ photo, dim }: { photo: string | null; dim?: number }) {
  if (!photo) {
    return (
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, width: SLIDE_WIDTH, height: SLIDE_HEIGHT,
          display: "flex",
          backgroundImage: `linear-gradient(160deg, #2a2d33 0%, ${C.charcoal} 55%, #0d0e10 100%)`,
        }}
      />
    );
  }
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: SLIDE_WIDTH, height: SLIDE_HEIGHT, display: "flex" }}>
      <img
        src={photo}
        alt=""
        width={SLIDE_WIDTH}
        height={SLIDE_HEIGHT}
        style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT, objectFit: "cover" }}
      />
      {dim ? (
        <div style={{ position: "absolute", top: 0, left: 0, width: SLIDE_WIDTH, height: SLIDE_HEIGHT, display: "flex", backgroundColor: `rgba(0,0,0,${dim})` }} />
      ) : null}
    </div>
  );
}

function Counter({ index, total, dark }: { index: number; total: number; dark: boolean }) {
  if (total <= 1) return null;
  return (
    <div
      style={{
        display: "flex",
        padding: "10px 22px",
        borderRadius: 999,
        backgroundColor: dark ? "rgba(255,255,255,0.14)" : "rgba(23,25,29,0.08)",
        color: dark ? C.base : C.charcoal,
        fontFamily: BODY_FONT,
        fontWeight: 600,
        fontSize: 26,
      }}
    >
      {`${index + 1}/${total}`}
    </div>
  );
}

function Logo({ src, height }: { src: string; height: number }) {
  // Rasio logo-sosmed.png = 360 × 264
  return <img src={src} alt="" height={height} width={Math.round((height * 360) / 264)} />;
}

/* ------------------------------ COVER ------------------------------ */

function CoverKotakPutih(p: SlideRenderInput) {
  const size = headlineSize(p.headline, 84);
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", position: "relative" }}>
      <PhotoLayer photo={p.photo} />
      <div style={{ position: "absolute", top: 48, right: 48, display: "flex" }}>
        <Counter index={p.index} total={p.total} dark />
      </div>
      <div
        style={{
          position: "absolute",
          left: 48,
          right: 48,
          bottom: 72,
          display: "flex",
          flexDirection: "column",
          backgroundColor: C.base,
          padding: "44px 52px 36px",
        }}
      >
        {p.kicker ? (
          <div
            style={{
              display: "flex",
              fontFamily: BODY_FONT,
              fontWeight: 600,
              fontSize: 28,
              letterSpacing: 3,
              color: C.brand,
              marginBottom: 18,
            }}
          >
            {p.kicker}
          </div>
        ) : null}
        <Headline text={p.headline} highlight={p.highlight} color={C.charcoal} accent={C.brand} size={size} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 30 }}>
          <div style={{ display: "flex", fontFamily: BODY_FONT, fontSize: 26, color: "#6b7280" }}>{p.site}</div>
          <Logo src={p.logo} height={72} />
        </div>
      </div>
    </div>
  );
}

function CoverSorot(p: SlideRenderInput) {
  const size = headlineSize(p.headline, 80);
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", position: "relative" }}>
      <PhotoLayer photo={p.photo} />
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, width: SLIDE_WIDTH, height: SLIDE_HEIGHT,
          display: "flex",
          backgroundImage:
            "linear-gradient(180deg, rgba(10,11,13,0.55) 0%, rgba(10,11,13,0) 22%, rgba(10,11,13,0) 38%, rgba(10,11,13,0.88) 66%, rgba(10,11,13,0.97) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 56,
          right: 48,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Logo src={p.logo} height={84} />
        <Counter index={p.index} total={p.total} dark />
      </div>
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 72,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {p.kicker ? (
          <div
            style={{
              display: "flex",
              fontFamily: BODY_FONT,
              fontWeight: 600,
              fontSize: 34,
              letterSpacing: 4,
              color: C.base,
              marginBottom: 20,
            }}
          >
            {p.kicker}
          </div>
        ) : null}
        <Headline text={p.headline} highlight={p.highlight} color={C.base} accent={C.brand} size={size} upper />
        <div style={{ display: "flex", marginTop: 40 }}>
          <div
            style={{
              display: "flex",
              border: "2px solid rgba(255,255,255,0.5)",
              borderRadius: 999,
              padding: "10px 26px",
              fontFamily: BODY_FONT,
              fontWeight: 600,
              fontSize: 26,
              color: C.base,
            }}
          >
            {`${p.site} · ${p.handle}`}
          </div>
        </div>
      </div>
    </div>
  );
}

function CoverBreaking(p: SlideRenderInput) {
  const size = headlineSize(p.headline, 92);
  const photoH = 760;
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", backgroundColor: C.charcoal }}>
      <div style={{ display: "flex", position: "relative", width: SLIDE_WIDTH, height: photoH, overflow: "hidden" }}>
        {p.photo ? (
          <img
            src={p.photo}
            alt=""
            width={SLIDE_WIDTH}
            height={SLIDE_HEIGHT}
            style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT, objectFit: "cover", marginTop: -180 }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              width: SLIDE_WIDTH,
              height: photoH,
              backgroundImage: `linear-gradient(160deg, #2a2d33 0%, ${C.charcoal} 100%)`,
            }}
          />
        )}
        <div style={{ position: "absolute", top: 48, left: 52, right: 48, display: "flex", justifyContent: "space-between" }}>
          <Logo src={p.logo} height={76} />
          <Counter index={p.index} total={p.total} dark />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "0 60px 56px", position: "relative" }}>
        <div style={{ display: "flex", marginTop: -34, marginBottom: 30 }}>
          <div
            style={{
              display: "flex",
              backgroundColor: C.breaking,
              color: C.base,
              fontFamily: BODY_FONT,
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: 4,
              padding: "14px 28px",
            }}
          >
            {p.kicker ? `BREAKING · ${p.kicker}` : "BREAKING NEWS"}
          </div>
        </div>
        <Headline text={p.headline} highlight={p.highlight} color={C.base} accent={C.brand} size={size} />
        <div style={{ display: "flex", flex: 1 }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(255,255,255,0.15)",
            paddingTop: 22,
            fontFamily: BODY_FONT,
            fontSize: 26,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <span>{p.handle}</span>
          <span>{p.site}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ POIN ------------------------------ */

function PointSlide(p: SlideRenderInput) {
  const dark = p.template !== "kotak-putih";
  const fg = dark ? C.base : C.charcoal;
  const sub = dark ? "rgba(255,255,255,0.65)" : "#6b7280";
  const body = p.slide.body ?? "";
  const size = body.length <= 120 ? 58 : body.length <= 180 ? 52 : 46;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: dark ? C.charcoal : C.base,
        padding: "56px 72px 64px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Logo src={p.logo} height={64} />
        <Counter index={p.index} total={p.total} dark={dark} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        <div style={{ display: "flex", width: 120, height: 12, backgroundColor: C.brand, marginBottom: 44 }} />
        {p.slide.title ? (
          <div
            style={{
              display: "flex",
              fontFamily: HEADING_FONT,
              fontWeight: 800,
              fontSize: 44,
              color: C.brand,
              marginBottom: 24,
            }}
          >
            {p.slide.title}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            fontFamily: HEADING_FONT,
            fontWeight: 700,
            fontSize: size,
            lineHeight: 1.3,
            letterSpacing: -0.5,
            color: fg,
          }}
        >
          {body}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: BODY_FONT,
          fontSize: 26,
          color: sub,
          borderTop: `2px solid ${dark ? "rgba(255,255,255,0.12)" : C.line}`,
          paddingTop: 22,
        }}
      >
        <span>{p.handle}</span>
        <span>Geser untuk lanjut →</span>
      </div>
    </div>
  );
}

/* ------------------------------ CTA ------------------------------ */

function CtaSlide(p: SlideRenderInput) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: C.charcoal,
        padding: "56px 72px 64px",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 14, display: "flex", backgroundColor: C.brand }} />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Counter index={p.index} total={p.total} dark />
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Logo src={p.logo} height={260} />
        <div
          style={{
            display: "flex",
            textAlign: "center",
            justifyContent: "center",
            fontFamily: HEADING_FONT,
            fontWeight: 800,
            fontSize: 64,
            lineHeight: 1.12,
            color: C.base,
            marginTop: 56,
          }}
        >
          {p.slide.title ?? ""}
        </div>
        {p.slide.body ? (
          <div
            style={{
              display: "flex",
              textAlign: "center",
              justifyContent: "center",
              fontFamily: BODY_FONT,
              fontSize: 34,
              lineHeight: 1.4,
              color: "rgba(255,255,255,0.72)",
              marginTop: 28,
              maxWidth: 860,
            }}
          >
            {p.slide.body}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            marginTop: 52,
            backgroundColor: C.brand,
            color: C.base,
            fontFamily: BODY_FONT,
            fontWeight: 600,
            fontSize: 34,
            padding: "18px 44px",
            borderRadius: 999,
          }}
        >
          {`Follow ${p.handle}`}
        </div>
      </div>
    </div>
  );
}

export function SlideView(p: SlideRenderInput): ReactElement {
  if (p.slide.kind === "point") return <PointSlide {...p} />;
  if (p.slide.kind === "cta") return <CtaSlide {...p} />;
  if (p.template === "sorot") return <CoverSorot {...p} />;
  if (p.template === "breaking") return <CoverBreaking {...p} />;
  return <CoverKotakPutih {...p} />;
}
