import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, hit, isBlocked, reset } from "@/lib/rate-limit";
import type { Role } from "@prisma/client";

/**
 * Auth.js (NextAuth v5) — email/password standar.
 * Session strategy JWT agar bisa dipakai di middleware (edge).
 * Role dibawa di token/session untuk kontrol akses server-side.
 */

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_PER_EMAIL = 5;
const LOGIN_MAX_PER_IP = 20;

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Sesi 7 hari; role & status tetap dicek ulang ke DB tiap menit (lihat jwt()).
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw, request) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        // Anti brute force: maks 5 gagal per 15 menit per email dan 20 per IP
        const emailKey = `login:email:${email.toLowerCase()}`;
        const ipKey = `login:ip:${clientIp(request.headers)}`;
        if (isBlocked(emailKey, LOGIN_MAX_PER_EMAIL) || isBlocked(ipKey, LOGIN_MAX_PER_IP)) {
          return null;
        }
        const fail = () => {
          hit(emailKey, LOGIN_MAX_PER_EMAIL, LOGIN_WINDOW_MS);
          hit(ipKey, LOGIN_MAX_PER_IP, LOGIN_WINDOW_MS);
          return null;
        };
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return fail();
        if (user.status === "SUSPENDED") return fail();

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return fail();
        reset(emailKey);

        // Catat waktu login terakhir (best-effort)
        await prisma.user
          .update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })
          .catch(() => {});

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image ?? undefined,
          role: user.role,
          isStaff: user.isStaff,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.isStaff = user.isStaff;
        token.checkedAt = Date.now();
        return token;
      }
      // Cek ulang ke DB maks tiap 60 detik: user yang di-suspend/dihapus
      // langsung keluar, perubahan role langsung berlaku (tidak menunggu
      // token kedaluwarsa).
      if (!token.sub) return null;
      if (Date.now() - Number(token.checkedAt ?? 0) > 60_000) {
        const fresh = await prisma.user
          .findUnique({
            where: { id: token.sub },
            select: { role: true, isStaff: true, status: true },
          })
          .catch(() => undefined); // DB sementara tak terjangkau → pakai token lama
        if (fresh === null || fresh?.status === "SUSPENDED") return null;
        if (fresh) {
          token.role = fresh.role;
          token.isStaff = fresh.isStaff;
          token.checkedAt = Date.now();
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as Role;
        session.user.isStaff = token.isStaff as boolean;
      }
      return session;
    },
  },
});
