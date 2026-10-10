import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

/**
 * Storage adapter — Cloudflare R2 (S3-compatible).
 * Lapisan tunggal agar mudah ditukar (R2 ↔ Supabase ↔ lainnya) tanpa
 * membongkar logika CMS. Semua akses file lewat fungsi di sini.
 */

export type UploadResult = {
  key: string;
  url: string;
};

function getConfig() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    return null;
  }
  return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl };
}

/** Apakah storage sudah dikonfigurasi (kredensial R2 terisi). */
export function isStorageConfigured(): boolean {
  return getConfig() !== null;
}

function getClient() {
  const cfg = getConfig();
  if (!cfg) throw new Error("Storage R2 belum dikonfigurasi (lihat .env).");
  return {
    client: new S3Client({
      region: "auto",
      endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.secretAccessKey,
      },
    }),
    cfg,
  };
}

/** Sanitasi nama file: hilangkan karakter berbahaya. */
export function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

/** Unggah buffer ke R2, kembalikan key + URL publik. */
export async function uploadObject(
  body: Buffer | Uint8Array,
  fileName: string,
  contentType: string,
): Promise<UploadResult> {
  const { client, cfg } = getClient();
  const safe = sanitizeFileName(fileName);
  const key = `media/${Date.now()}-${safe}`;

  await client.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return {
    key,
    url: `${cfg.publicUrl.replace(/\/$/, "")}/${key}`,
  };
}

/** Hapus objek dari R2. */
export async function deleteObject(key: string): Promise<void> {
  const { client, cfg } = getClient();
  await client.send(
    new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key }),
  );
}
