import { connection } from "next/server";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";
import { SettingsForm } from "@/components/cms/settings-form";

export const instant = false;

type General = {
  siteName: string;
  tagline: string;
  contactEmail: string;
  gscVerification: string;
};

async function loadGeneral(): Promise<General> {
  const fallback: General = {
    siteName: siteConfig.name,
    tagline: siteConfig.tagline,
    contactEmail: "",
    gscVerification: "",
  };
  try {
    const row = await prisma.setting.findUnique({ where: { key: "general" } });
    if (row?.value && typeof row.value === "object") {
      return { ...fallback, ...(row.value as Partial<General>) };
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export default async function SettingsPage() {
  await connection();
  await requirePermission("settings.manage");
  const initial = await loadGeneral();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold">Website Settings</h1>
      <SettingsForm initial={initial} />
    </div>
  );
}
