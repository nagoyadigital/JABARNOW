import { connection } from "next/server";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";
import { RedirectManager } from "@/components/cms/redirect-manager";

export const instant = false;

/**
 * SEO Manager — status sitemap/robots + redirect manager.
 * GSC/GA4 integration-ready: field verifikasi di Website Settings/env.
 * Tidak menampilkan "indexed URLs" sebagai data nyata tanpa sumber GSC.
 */
async function loadRedirects() {
  try {
    return {
      ok: true,
      rows: await prisma.redirect.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    };
  } catch {
    return { ok: false, rows: [] as never[] };
  }
}

export default async function SeoPage() {
  await connection();
  await requirePermission("seo.manage");
  const { rows } = await loadRedirects();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-xl font-semibold">SEO Manager</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatusCard title="Sitemap" value="Aktif" href={`${siteConfig.url}/sitemap.xml`} />
        <StatusCard title="News Sitemap" value="Aktif" href={`${siteConfig.url}/news-sitemap.xml`} />
        <StatusCard title="robots.txt" value="Aktif" href={`${siteConfig.url}/robots.txt`} />
      </div>

      <div className="rounded-[var(--radius-card)] border border-line bg-base p-5 text-sm text-charcoal/70">
        <p className="mb-1 font-semibold text-charcoal">Integrasi (integration-ready)</p>
        <p>
          GA4 &amp; Google Search Console siap dihubungkan tanpa live wajib saat
          peluncuran. Isi <code>NEXT_PUBLIC_GA4_MEASUREMENT_ID</code> dan{" "}
          <code>GSC_VERIFICATION</code> di <code>.env</code> untuk mengaktifkan.
          Angka &quot;indexed URLs&quot;/impressions hanya ditampilkan bila sumber
          GSC tersedia.
        </p>
      </div>

      <RedirectManager rows={rows} />
    </div>
  );
}

function StatusCard({ title, value, href }: { title: string; value: string; href: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-base p-4">
      <p className="text-xs text-charcoal/50">{title}</p>
      <p className="mt-1 text-lg font-semibold text-brand">{value}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 block truncate text-xs text-charcoal/50 hover:text-brand"
      >
        {href}
      </a>
    </div>
  );
}
