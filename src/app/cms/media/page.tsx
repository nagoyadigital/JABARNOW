import { connection } from "next/server";
import Image from "next/image";
import { requirePermission } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { isStorageConfigured } from "@/lib/storage";
import { MediaUploader } from "@/components/cms/media-uploader";

export const instant = false;

/**
 * Media Library — grid aset + upload. Butuh izin media.manage.
 */
async function loadMedia() {
  try {
    return {
      ok: true,
      rows: await prisma.mediaAsset.findMany({
        orderBy: { createdAt: "desc" },
        take: 60,
        select: {
          id: true,
          url: true,
          fileName: true,
          mimeType: true,
          sizeBytes: true,
        },
      }),
    };
  } catch {
    return { ok: false, rows: [] as never[] };
  }
}

export default async function MediaPage() {
  await connection();
  await requirePermission("media.manage");
  const storageReady = isStorageConfigured();
  const { ok, rows } = await loadMedia();

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-5 text-xl font-semibold">Media Library</h1>

      <div className="mb-6">
        <MediaUploader storageReady={storageReady} />
      </div>

      {!ok ? (
        <Empty text="Database belum tersambung." />
      ) : rows.length === 0 ? (
        <Empty text="Belum ada media. Unggah gambar pertama Anda." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((m) => (
            <figure
              key={m.id}
              className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-base"
            >
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={m.url}
                  alt={m.fileName}
                  fill
                  sizes="(min-width:1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="truncate p-2 text-xs text-charcoal/60" title={m.fileName}>
                {m.fileName}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-base p-8 text-center text-sm text-charcoal/60">
      {text}
    </div>
  );
}
