import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

/**
 * BrandLogo — menampilkan logo resmi (upload manual via CMS).
 * Menjaga rasio asli; tidak merekonstruksi dari mockup.
 * Lokasi: header & footer.
 */
export function BrandLogo({
  className,
  height = 40,
  priority = false,
}: {
  className?: string;
  height?: number;
  priority?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — beranda`}
      className={className}
    >
      {/* height & width:auto menjaga rasio asli; height mengontrol tinggi tampil */}
      <Image
        src={siteConfig.logo.src}
        alt={siteConfig.logo.alt}
        height={height}
        width={height * 4}
        priority={priority}
        style={{ height: `${height}px`, width: "auto" }}
      />
    </Link>
  );
}
