import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { siteConfig } from "@/lib/site-config";
import { GA4 } from "@/components/common/ga4";
import "./globals.css";

// Judul: Plus Jakarta Sans (700-800). Body/UI: Inter (400-600).
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  // Penulis konten = redaksi; kredit developer (Nagoya Digital) tetap di
  // metadata "creator" dan footer situs.
  authors: [{ name: `Redaksi ${siteConfig.name}`, url: siteConfig.url }],
  creator: siteConfig.developer.name,
  publisher: siteConfig.name,
  // Catatan: canonical TIDAK diset di sini (akan diwarisi semua halaman);
  // tiap halaman menetapkan canonical-nya sendiri.
  alternates: {
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${siteConfig.name} — RSS` }] },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  // GSC verification — colok nanti via env (integration-ready)
  verification: process.env.GSC_VERIFICATION
    ? { google: process.env.GSC_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-base text-charcoal">
        {children}
        <GA4 />
      </body>
    </html>
  );
}
