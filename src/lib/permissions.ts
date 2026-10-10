import type { Role } from "@prisma/client";

/**
 * Permission granular (09-CMS-REVIEW-AND-PERMISSIONS.md).
 * `design.manage` HANYA Super Admin.
 * Matriks ini adalah sumber kebenaran kontrol akses — diverifikasi SERVER-SIDE,
 * bukan sekadar menyembunyikan tombol di UI.
 */
export const PERMISSIONS = [
  "article.create",
  "article.edit_own",
  "article.edit_any",
  "article.submit",
  "article.review",
  "article.approve",
  "article.publish",
  "article.schedule",
  "article.delete",
  "media.manage",
  "ads.manage",
  "seo.manage",
  "analytics.view",
  "comments.moderate",
  "users.manage",
  "settings.manage",
  "design.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL: Permission[] = [...PERMISSIONS];

/**
 * Matriks role → daftar permission.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: ALL, // seluruh sistem termasuk design.manage

  ADMINISTRATOR: [
    "article.create",
    "article.edit_own",
    "article.edit_any",
    "article.submit",
    "article.review",
    "article.approve",
    "article.publish",
    "article.schedule",
    "article.delete",
    "media.manage",
    "ads.manage",
    "seo.manage",
    "analytics.view",
    "comments.moderate",
    "users.manage",
    "settings.manage",
    // TIDAK termasuk design.manage (hanya Super Admin)
  ],

  PEMIMPIN_REDAKSI: [
    "article.create",
    "article.edit_own",
    "article.edit_any",
    "article.submit",
    "article.review",
    "article.approve",
    "article.publish",
    "article.schedule",
    "article.delete",
    "media.manage",
    "analytics.view",
    "comments.moderate",
  ],

  EDITOR: [
    "article.create",
    "article.edit_own",
    "article.edit_any",
    "article.submit",
    "article.review",
    "article.approve",
    // publish/schedule hanya jika diberikan izin (default tidak)
    "media.manage",
    "comments.moderate",
  ],

  REPORTER: [
    "article.create",
    "article.edit_own",
    "article.submit",
  ],

  CONTRIBUTOR: [
    "article.create",
    "article.edit_own",
    "article.submit",
    // tidak publish
  ],

  ADS_MANAGER: [
    "ads.manage",
    "analytics.view",
  ],

  SEO_MANAGER: [
    "seo.manage",
    "analytics.view",
    // tidak mengubah role/security
  ],
};

/** Apakah role punya permission tertentu. */
export function hasPermission(
  role: Role | undefined | null,
  permission: Permission,
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Label role untuk tampilan UI (Bahasa Indonesia). */
export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMINISTRATOR: "Administrator",
  PEMIMPIN_REDAKSI: "Pemimpin Redaksi",
  EDITOR: "Editor",
  REPORTER: "Reporter",
  CONTRIBUTOR: "Contributor",
  ADS_MANAGER: "Ads Manager",
  SEO_MANAGER: "SEO Manager",
};
