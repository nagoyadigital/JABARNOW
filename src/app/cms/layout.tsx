import type { Metadata } from "next";
import { CmsSidebar } from "@/components/cms/cms-sidebar";
import { CmsTopbar } from "@/components/cms/cms-topbar";

export const metadata: Metadata = {
  title: "CMS",
  robots: { index: false, follow: false }, // CMS tidak boleh terindex
};

/**
 * Shell CMS: sidebar charcoal + topbar terang + workspace muted.
 * Proteksi akses (auth + role) ditambahkan di Tahap 3 (server-side).
 */
export default function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted">
      <CmsSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <CmsTopbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
