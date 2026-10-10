import type { Metadata } from "next";
import { connection } from "next/server";
import { requireStaff } from "@/lib/guard";
import { CmsSidebar } from "@/components/cms/cms-sidebar";
import { CmsTopbar } from "@/components/cms/cms-topbar";

export const metadata: Metadata = {
  title: "CMS",
  robots: { index: false, follow: false }, // CMS tidak boleh terindex
};

// Area CMS bergantung pada sesi (cookies/crypto Auth.js) → route blocking.
export const instant = false;

/**
 * Shell CMS: sidebar charcoal + topbar terang + workspace muted.
 * Proteksi akses: requireStaff() + middleware (/cms/*). Role dipakai untuk
 * menyembunyikan menu yang tidak diizinkan (enforcement tetap per-halaman).
 */
export default async function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Render di request time (sesi/cookies + crypto Auth.js) — Cache Components.
  await connection();
  const session = await requireStaff();

  return (
    <div className="flex min-h-screen bg-muted">
      <CmsSidebar role={session.user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <CmsTopbar
          name={session.user.name ?? "Pengguna"}
          role={session.user.role}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
