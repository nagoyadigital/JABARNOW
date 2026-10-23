import Link from "next/link";
import { footerGroups } from "@/lib/navigation";
import { siteConfig } from "@/lib/site-config";
import { SocialIconRow } from "@/components/public/social-links";

/**
 * SiteFooter — footer terang selebar layar (override design lock 2026-10-23):
 * kiri nama + deskripsi + ikon sosial; kanan tiga kelompok tautan
 * (Tentang, Kerjasama, Legal); bawah copyright + kredit pengembang.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-muted">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-10 md:px-8 lg:px-12 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <p className="font-heading text-xl font-extrabold uppercase tracking-tight">
              {siteConfig.name}
            </p>
            <p className="mt-3 max-w-sm text-sm text-charcoal/60">
              Portal berita Jawa Barat — kabar terbaru dari 27 kabupaten/kota.
            </p>
            <div className="mt-5">
              <SocialIconRow size="md" />
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 lg:contents">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-xs font-bold uppercase tracking-[0.15em]">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-3 text-sm">
                  {group.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-charcoal/70 transition-colors hover:text-brand"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-line pt-6 text-center text-xs text-charcoal/50 sm:flex-row sm:justify-between sm:text-left">
          <p>
            © {siteConfig.copyrightYear} {siteConfig.name} All rights reserved.
          </p>
          <p>
            Developed by{" "}
            <a
              href={siteConfig.developer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-charcoal/70 transition-colors hover:text-brand"
            >
              {siteConfig.developer.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
