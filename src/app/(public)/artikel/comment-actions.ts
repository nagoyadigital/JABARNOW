"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Komentar publik — WAJIB LOGIN. Komentar baru berstatus PENDING,
 * ditampilkan setelah dimoderasi (comments.moderate di CMS).
 */

const schema = z.object({
  articleId: z.string(),
  body: z.string().min(2, "Komentar terlalu pendek").max(2000),
});

export type CommentState = {
  ok?: boolean;
  error?: string;
  requireLogin?: boolean;
};

export async function postComment(
  input: z.input<typeof schema>,
): Promise<CommentState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { requireLogin: true, error: "Masuk untuk berkomentar." };
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  try {
    await prisma.comment.create({
      data: {
        articleId: parsed.data.articleId,
        userId: session.user.id,
        body: parsed.data.body,
        status: "PENDING",
      },
    });
    return { ok: true };
  } catch {
    return { error: "Gagal mengirim komentar." };
  }
}

/** Ambil komentar yang sudah disetujui untuk sebuah artikel. */
export async function getApprovedComments(articleId: string) {
  try {
    return await prisma.comment.findMany({
      where: { articleId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        body: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });
  } catch {
    return [];
  }
}
