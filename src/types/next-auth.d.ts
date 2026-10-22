import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

/**
 * Augmentasi tipe Auth.js untuk membawa role & isStaff.
 */
declare module "next-auth" {
  interface User {
    role: Role;
    isStaff: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      isStaff: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    isStaff?: boolean;
    // Waktu terakhir role/status dicek ulang ke DB (ms)
    checkedAt?: number;
  }
}
