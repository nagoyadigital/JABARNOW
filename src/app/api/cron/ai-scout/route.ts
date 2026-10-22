import { NextRequest, NextResponse } from "next/server";
import { runScout } from "@/lib/ai/scout";
import { isAgentBusy } from "@/lib/ai/agent-run";

/**
 * Cron: AI Desk — Scout mengambil topik baru dari semua sumber aktif.
 * Diproteksi header Authorization: Bearer <CRON_SECRET> (sama dengan cron publish).
 *
 * Contoh crontab VPS (tiap 15 menit):
 *   *\/15 * * * * curl -s -X POST -H "Authorization: Bearer $CRON_SECRET" \
 *     https://jabarnow.id/api/cron/ai-scout
 */

export const maxDuration = 300;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // tanpa secret, tolak (aman secara default)
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function handle(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (await isAgentBusy("SCOUT")) {
      return NextResponse.json({ ok: true, skipped: "Scout masih berjalan" });
    }
    const result = await runScout({ trigger: "cron" });
    return NextResponse.json({
      ok: true,
      created: result.created,
      failedSources: result.failed,
      sources: result.sources.length,
    });
  } catch (err) {
    console.error("cron ai-scout:", err);
    return NextResponse.json({ error: "Gagal memproses" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
