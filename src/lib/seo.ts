import { siteConfig } from "@/lib/site-config";

/**
 * Util SEO: JSON-LD aman + schema dasar organisasi/situs/breadcrumb.
 */

/**
 * Serialisasi JSON-LD yang aman ditaruh di <script>: karakter `<`, `>`, `&`
 * dan pemisah baris Unicode di-escape agar judul berisi "</script>" tidak
 * bisa keluar dari tag script (XSS).
 */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(new RegExp("\\u2028", "g"), "\\u2028")
    .replace(new RegExp("\\u2029", "g"), "\\u2029");
}

const base = () => siteConfig.url.replace(/\/+$/, "");

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${base()}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Publisher (Organization) — dipakai NewsArticle & homepage. */
export function publisherLd() {
  return {
    "@type": "NewsMediaOrganization",
    "@id": `${base()}/#organization`,
    name: siteConfig.name,
    url: base(),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(siteConfig.logo.src),
    },
  };
}

/** WebSite + SearchAction (kotak pencarian di hasil Google). */
export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { ...publisherLd() },
      {
        "@type": "WebSite",
        "@id": `${base()}/#website`,
        url: base(),
        name: siteConfig.name,
        description: siteConfig.description,
        inLanguage: "id-ID",
        publisher: { "@id": `${base()}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${base()}/cari?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}
