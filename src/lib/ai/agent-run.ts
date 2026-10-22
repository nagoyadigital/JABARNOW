import type { AgentName, AgentRunStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Log setiap putaran agent (status, jumlah item, token, biaya).
 * Menjadi sumber data status agent & pelacak biaya di dashboard AI Desk.
 */

/** Putaran yang "RUNNING" lebih lama dari ini dianggap macet. */
const STALE_MINUTES = 15;

export async function startRun(agent: AgentName, trigger: string) {
  return prisma.agentRun.create({
    data: { agent, trigger: trigger.slice(0, 100) },
    select: { id: true },
  });
}

export async function finishRun(
  id: string,
  data: {
    status: Exclude<AgentRunStatus, "RUNNING">;
    items?: number;
    tokensIn?: number;
    tokensOut?: number;
    costUsd?: number;
    summary?: string;
    error?: string;
  },
) {
  try {
    await prisma.agentRun.update({
      where: { id },
      data: { ...data, finishedAt: new Date() },
    });
  } catch (err) {
    console.error("finishRun gagal:", err);
  }
}

/**
 * Apakah agent sedang berjalan? Mencegah dua putaran tumpang tindih
 * (mis. cron + tombol manual). Putaran macet ditandai ERROR otomatis.
 */
export async function isAgentBusy(agent: AgentName): Promise<boolean> {
  const staleBefore = new Date(Date.now() - STALE_MINUTES * 60_000);
  await prisma.agentRun.updateMany({
    where: { agent, status: "RUNNING", startedAt: { lt: staleBefore } },
    data: { status: "ERROR", error: "Macet / timeout", finishedAt: new Date() },
  });
  const running = await prisma.agentRun.count({
    where: { agent, status: "RUNNING" },
  });
  return running > 0;
}
