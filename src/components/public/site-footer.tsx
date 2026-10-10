import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { footerGroups } from "@/lib/navigation";
import { siteConfig } from "@/lib/site-config";

/**
 * SiteFooter — footer charcoal, empat kelompok terkunci.
 * Jumlah kelompok (4) tidak boleh berubah tanpa approval Super Admin.
 * Menampilkan kredit "Developed by Nagoya Digital".
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto bg-charcoal text-white/80">
      <div className="container-jn py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Kolom brand (deskripsi + sosial) */}
          <div className="col-span-2 lg:col-span-1">
            <BrandLogo height={40} />
            <p className="mt-4 text-sm text-white/60">
              {siteConfig.description}
            </p>
          </div>

          {/* Empat kelompok tautan */}
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold text-white">
                {group.title}
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {group.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-white/60 transition-colors hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {siteConfig.copyrightYear} {siteConfig.name}. All Rights
            Reserved.
          </p>
          <p>
            Developed by{" "}
            <a
              href={siteConfig.developer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white/70 transition-colors hover:text-brand"
            >
              {siteConfig.developer.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
