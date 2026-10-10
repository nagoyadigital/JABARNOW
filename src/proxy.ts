import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Proxy (Next.js 16, menggantikan middleware) — proteksi route.
 * Area /cms hanya untuk staf terautentikasi (edge-safe, tanpa Prisma/bcrypt).
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // authConfig.callbacks.authorized menangani keputusan akses /cms.
  // Mengembalikan undefined = lanjutkan request yang diizinkan.
  void req;
});

export const config = {
  matcher: ["/cms/:path*"],
};
