import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";

/**
 * Cron: publish artikel terjadwal.
 * Mengubah SCHEDULED → PUBLISHED untuk artikel yang scheduledAt <= sekarang.
 * Diproteksi header Authorization: Bearer <CRON_SECRET>.
 *
 * Dipanggil oleh crontab Linux di VPS (atau Vercel Cron), contoh:
 *   * * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" \
 *     https://jabarnow.id/api/cron/publish-scheduled
 */

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // tanpa secret, tolak (aman secara default)
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

async function handle(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  try {
    const due = await prisma.article.findMany({
      where: { status: "SCHEDULED", scheduledAt: { lte: now } },
      select: { id: true },
      take: 100,
    });

    if (due.length === 0) {
      return NextResponse.json({ ok: true, published: 0 });
    }

    const ids = due.map((a) => a.id);
    await prisma.article.updateMany({
      where: { id: { in: ids } },
      data: { status: "PUBLISHED", publishedAt: now },
    });

    await writeAudit({
      action: "cron.publish_scheduled",
      entity: "Article",
      metadata: { count: ids.length },
    });

    return NextResponse.json({ ok: true, published: ids.length });
  } catch (err) {
    console.error("cron publish-scheduled:", err);
    return NextResponse.json({ error: "Gagal memproses" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
