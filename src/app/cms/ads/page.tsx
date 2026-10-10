import { connection } from "next/server";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { AdCampaignForm } from "@/components/cms/ad-campaign-form";

export const instant = false;

/**
 * Ads Manager — daftar kampanye + form. Butuh izin ads.manage.
 */
async function loadCampaigns() {
  try {
    return {
      ok: true,
      rows: await prisma.adCampaign.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    };
  } catch {
    return { ok: false, rows: [] as never[] };
  }
}

const PLACEMENT_LABEL: Record<string, string> = {
  HEADER_LEADERBOARD: "Header Leaderboard",
  SIDEBAR: "Sidebar",
  IN_FEED: "In-Feed",
  IN_ARTICLE: "In-Article",
  FOOTER: "Footer",
  MOBILE_AFTER_HERO: "Mobile Setelah Hero",
};

export default async function AdsPage() {
  await connection();
  await requirePermission("ads.manage");
  const { ok, rows } = await loadCampaigns();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-xl font-semibold">Ads Manager</h1>

      <AdCampaignForm />

      <div className="rounded-[var(--radius-card)] border border-line bg-base p-5">
        <h2 className="mb-3 text-sm font-semibold">Kampanye</h2>
        {!ok ? (
          <p className="text-sm text-charcoal/60">Database belum tersambung.</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-charcoal/60">Belum ada kampanye.</p>
        ) : (
          <ul className="divide-y divide-line text-sm">
            {rows.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-charcoal/50">
                    {c.creativeType} · {PLACEMENT_LABEL[c.placement] ?? c.placement}
                  </p>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    c.isActive ? "bg-brand/10 text-brand" : "bg-muted text-charcoal/50"
                  }`}
                >
                  {c.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
