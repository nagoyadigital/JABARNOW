import type { ComponentType } from "react";
import { siteConfig, type SocialPlatform } from "@/lib/site-config";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from "@/components/common/icons";

const ICONS: Record<SocialPlatform, ComponentType<{ className?: string }>> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  x: XIcon,
  tiktok: TikTokIcon,
};

/** Warna tile per platform (widget kolom kanan). */
const TILE_COLORS: Record<SocialPlatform, string> = {
  facebook: "bg-[#1877f2]",
  instagram: "bg-[#d62976]",
  youtube: "bg-[#e62117]",
  x: "bg-charcoal",
  tiktok: "bg-[#25262b]",
};

const nf = new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 });

/**
 * SocialIconRow — deret ikon bulat akun sosial (sidebar kiri & footer).
 * Akun tanpa URL (href kosong di siteConfig.social) tampil non-aktif.
 */
export function SocialIconRow({ size = "sm" }: { size?: "sm" | "md" }) {
  const box = size === "md" ? "h-10 w-10" : "h-8 w-8";
  return (
    <ul className={`flex flex-wrap ${size === "md" ? "gap-3" : "gap-1.5"}`}>
      {siteConfig.social.map(({ platform, label, href }) => {
        const Icon = ICONS[platform];
        const cls = `flex ${box} items-center justify-center rounded-full bg-charcoal/[0.06] text-charcoal/80`;
        return (
          <li key={platform}>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`${cls} transition-colors hover:bg-brand hover:text-white`}
              >
                <Icon className="h-4 w-4" />
              </a>
            ) : (
              <span aria-label={`${label} (segera hadir)`} title={`${label} — segera hadir`} className={`${cls} opacity-60`}>
                <Icon className="h-4 w-4" />
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * SocialTiles — widget kolom kanan "Ikuti Kami": tile berwarna per platform
 * dengan jumlah pengikut (diisi manual di siteConfig.social; null → "Ikuti").
 */
export function SocialTiles() {
  return (
    <section aria-labelledby="ikuti-kami">
      <h2 id="ikuti-kami" className="mb-3 text-sm font-bold">
        Ikuti Kami
      </h2>
      <ul className="grid grid-cols-2 gap-2">
        {siteConfig.social.map(({ platform, label, href, followers }) => {
          const Icon = ICONS[platform];
          const body = (
            <>
              <Icon className="h-4 w-4 shrink-0" />
              <span className="min-w-0 leading-tight">
                <span className="block text-sm font-bold">
                  {followers != null ? nf.format(followers) : label}
                </span>
                <span className="block text-[10px] uppercase tracking-wide text-white/70">
                  {followers != null ? "Pengikut" : "Ikuti"}
                </span>
              </span>
            </>
          );
          const cls = `flex items-center gap-3 rounded-lg px-3 py-2.5 text-white ${TILE_COLORS[platform]}`;
          return (
            <li key={platform}>
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} JabarNow!`} className={`${cls} transition-opacity hover:opacity-90`}>
                  {body}
                </a>
              ) : (
                <span title={`${label} — segera hadir`} className={cls}>
                  {body}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
