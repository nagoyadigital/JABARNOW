/**
 * Navigation map CMS (07-CMS-IA-AND-OVERVIEW.md).
 * Visibilitas item mengikuti permission (diterapkan server-side di Tahap 3).
 * `permission` dicatat sekarang sebagai acuan; enforcement menyusul.
 */

export type CmsNavItem = {
  label: string;
  href: string;
  permission?: string;
};

export type CmsNavGroup = {
  title: string;
  items: CmsNavItem[];
};

export const cmsNavGroups: CmsNavGroup[] = [
  {
    title: "Dashboard",
    items: [{ label: "Overview", href: "/cms" }],
  },
  {
    title: "Konten",
    items: [
      { label: "Artikel", href: "/cms/artikel", permission: "article.edit_own" },
      { label: "Tulis Artikel", href: "/cms/artikel/tulis", permission: "article.create" },
      { label: "Review & Persetujuan", href: "/cms/review", permission: "article.review" },
      { label: "Media Library", href: "/cms/media", permission: "media.manage" },
      { label: "Kategori", href: "/cms/kategori" },
      { label: "Wilayah", href: "/cms/wilayah" },
      { label: "Tag", href: "/cms/tag" },
      { label: "Komentar", href: "/cms/komentar" },
    ],
  },
  {
    title: "Monetisasi",
    items: [{ label: "Ads Manager", href: "/cms/ads", permission: "ads.manage" }],
  },
  {
    title: "SEO & Analytics",
    items: [
      { label: "SEO Manager", href: "/cms/seo", permission: "seo.manage" },
      { label: "Analytics", href: "/cms/analytics", permission: "analytics.view" },
    ],
  },
  {
    title: "Manajemen",
    items: [
      { label: "Users & Roles", href: "/cms/users", permission: "users.manage" },
      { label: "Website Settings", href: "/cms/settings", permission: "settings.manage" },
      { label: "Notifikasi", href: "/cms/notifikasi" },
      { label: "Audit Log", href: "/cms/audit" },
    ],
  },
];
