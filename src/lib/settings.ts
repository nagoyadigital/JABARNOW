import { prisma } from "@/lib/prisma";

/**
 * Baca Website Settings (key-value) dengan fallback aman.
 */

export type GeneralSettings = {
  siteName?: string;
  tagline?: string;
  contactEmail?: string;
  gscVerification?: string;
  // Fitur komentar publik (default: nonaktif)
  commentsEnabled?: boolean;
};

export async function getGeneralSettings(): Promise<GeneralSettings> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "general" } });
    if (row?.value && typeof row.value === "object") {
      return row.value as GeneralSettings;
    }
  } catch {
    /* abaikan */
  }
  return {};
}

/** Apakah kolom komentar publik diaktifkan (default: false). */
export async function areCommentsEnabled(): Promise<boolean> {
  const s = await getGeneralSettings();
  return s.commentsEnabled === true;
}
