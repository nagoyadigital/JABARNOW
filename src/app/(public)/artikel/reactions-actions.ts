"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Reaksi emote artikel — WAJIB LOGIN.
 * Satu user satu reaksi per artikel (bisa diganti tipenya atau dibatalkan).
 */

const schema = z.object({
  articleId: z.string(),
  type: z.enum(["LIKE", "LOVE", "INSIGHTFUL", "SAD", "ANGRY"]),
});

export type ReactionState = {
  error?: string;
  requireLogin?: boolean;
  counts?: Record<string, number>;
  mine?: string | null;
};

export async function getReactions(articleId: string): Promise<ReactionState> {
  const session = await auth();
  try {
    const grouped = await prisma.reaction.groupBy({
      by: ["type"],
      where: { articleId },
      _count: { type: true },
    });
    const counts: Record<string, number> = {};
    for (const g of grouped) counts[g.type] = g._count.type;

    let mine: string | null = null;
    if (session?.user?.id) {
      const r = await prisma.reaction.findUnique({
        where: { articleId_userId: { articleId, userId: session.user.id } },
        select: { type: true },
      });
      mine = r?.type ?? null;
    }
    return { counts, mine };
  } catch {
    return { counts: {}, mine: null };
  }
}

export async function toggleReaction(
  input: z.input<typeof schema>,
): Promise<ReactionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { requireLogin: true, error: "Masuk untuk memberi reaksi." };
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Input tidak valid" };
  const { articleId, type } = parsed.data;
  const userId = session.user.id;

  try {
    const existing = await prisma.reaction.findUnique({
      where: { articleId_userId: { articleId, userId } },
    });
    if (existing && existing.type === type) {
      // Klik tipe yang sama → batalkan
      await prisma.reaction.delete({
        where: { articleId_userId: { articleId, userId } },
      });
    } else {
      await prisma.reaction.upsert({
        where: { articleId_userId: { articleId, userId } },
        update: { type },
        create: { articleId, userId, type },
      });
    }
    return getReactions(articleId);
  } catch {
    return { error: "Gagal menyimpan reaksi." };
  }
}
