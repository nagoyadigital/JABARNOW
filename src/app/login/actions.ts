"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

/**
 * Server action login. Mengembalikan pesan error untuk ditampilkan di form.
 */
export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/cms",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email atau kata sandi salah." };
    }
    // signIn melempar redirect saat sukses — biarkan Next.js menanganinya
    throw error;
  }
}
