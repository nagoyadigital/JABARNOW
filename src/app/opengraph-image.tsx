import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

/**
 * Gambar Open Graph default (homepage & halaman tanpa cover) 1200×630.
 * Dipakai saat tautan JabarNow! dibagikan ke WhatsApp, Facebook, X, dll.
 */
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const assets = join(process.cwd(), "src", "assets");
  const [logo, font, fontBody] = await Promise.all([
    readFile(join(assets, "brand", "logo-sosmed.png")),
    readFile(join(assets, "fonts", "PlusJakartaSans-ExtraBold.ttf")),
    readFile(join(assets, "fonts", "Inter-Regular.ttf")),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          backgroundColor: "#17191d",
          padding: "0 90px",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 16, display: "flex", backgroundColor: "#f4511e" }} />
        <img src={logoSrc} alt="" width={420} height={308} />
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 70, flex: 1 }}>
          <div style={{ display: "flex", fontFamily: "Plus Jakarta Sans", fontSize: 62, lineHeight: 1.1, color: "#ffffff" }}>
            {siteConfig.tagline}
          </div>
          <div style={{ display: "flex", fontFamily: "Inter", fontSize: 30, marginTop: 24, color: "rgba(255,255,255,0.7)" }}>
            Berita terkini dari 27 kabupaten/kota
          </div>
          <div style={{ display: "flex", fontFamily: "Inter", fontSize: 28, marginTop: 36, color: "#f4511e" }}>
            {siteConfig.url.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Plus Jakarta Sans", data: font, weight: 800, style: "normal" },
        { name: "Inter", data: fontBody, weight: 400, style: "normal" },
      ],
    },
  );
}
