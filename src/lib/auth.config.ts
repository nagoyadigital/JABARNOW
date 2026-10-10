import type { NextAuthConfig } from "next-auth";

/**
 * Konfigurasi Auth.js edge-safe untuk middleware.
 * TIDAK mengimpor Prisma/bcrypt (tidak jalan di edge runtime).
 * Hanya menilai otorisasi berdasarkan token JWT.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [], // provider lengkap ada di src/lib/auth.ts (Node runtime)
  callbacks: {
    authorized({ auth, request }) {
      const isCms = request.nextUrl.pathname.startsWith("/cms");
      if (!isCms) return true;
      // Hanya staf yang boleh masuk area CMS
      return Boolean(auth?.user?.isStaff);
    },
  },
} satisfies NextAuthConfig;
