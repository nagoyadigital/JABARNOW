import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { uploadObject, isStorageConfigured } from "@/lib/storage";
import { writeAudit } from "@/lib/audit";

/**
 * Upload media ke Cloudflare R2 + simpan metadata.
 * Proteksi: hanya staf dengan media.manage. Validasi MIME & ukuran.
 */

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.isStaff || !hasPermission(session.user.role, "media.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: "Storage R2 belum dikonfigurasi (lihat .env)." },
      { status: 503 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: "Tipe file tidak didukung" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Ukuran melebihi 10 MB" }, { status: 413 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { key, url } = await uploadObject(buffer, file.name, file.type);

    const asset = await prisma.mediaAsset.create({
      data: {
        storageKey: key,
        url,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        uploaderId: session.user.id,
      },
    });

    await writeAudit({
      actorId: session.user.id,
      action: "media.upload",
      entity: "MediaAsset",
      entityId: asset.id,
    });

    return NextResponse.json({ ok: true, asset });
  } catch (err) {
    console.error("media upload:", err);
    return NextResponse.json({ error: "Gagal mengunggah" }, { status: 500 });
  }
}
