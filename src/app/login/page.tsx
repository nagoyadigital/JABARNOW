import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk",
  robots: { index: false, follow: false },
};

/**
 * Halaman login staf redaksi (dan pembaca). Form di komponen klien.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-line bg-base p-6 shadow-sm">
        <div className="mb-6 flex justify-center">
          <BrandLogo height={40} />
        </div>
        <h1 className="mb-1 text-center text-lg font-semibold">Masuk</h1>
        <p className="mb-6 text-center text-sm text-charcoal/60">
          Masuk ke akun JabarNow! Anda
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
