import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/permissions";
import type { Session } from "next-auth";

/**
 * Guard server-side untuk halaman & server action CMS.
 * Mengembalikan session yang terverifikasi, atau redirect ke /login.
 * Kontrol akses WAJIB di server (bukan hanya sembunyikan tombol).
 */

export async function requireStaff(): Promise<Session> {
  const session = await auth();
  if (!session?.user || !session.user.isStaff) {
    redirect("/login");
  }
  return session;
}

export async function requirePermission(
  permission: Permission,
): Promise<Session> {
  const session = await requireStaff();
  if (!hasPermission(session.user.role, permission)) {
    redirect("/cms/forbidden");
  }
  return session;
}

/** Varian non-redirect: untuk server action yang perlu melempar error. */
export async function assertPermission(
  permission: Permission,
): Promise<Session> {
  const session = await auth();
  if (!session?.user?.isStaff || !hasPermission(session.user.role, permission)) {
    throw new Error("Forbidden: izin tidak mencukupi");
  }
  return session;
}
