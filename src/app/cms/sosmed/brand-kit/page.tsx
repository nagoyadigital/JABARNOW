import Link from "next/link";
import { connection } from "next/server";
import { requirePermission } from "@/lib/guard";
import { getBrandKit, TEMPLATE_KEYS, TEMPLATE_LABELS } from "@/lib/social/brand-kit";
import { isAiConfigured, aiModelName } from "@/lib/ai/llm";
import { BrandKitForm } from "@/components/cms/sosmed-controls";

export const instant = false;

/**
 * Studio Sosmed — Brand Kit: handle, slide penutup, template default, otomatisasi.
 */
export default async function BrandKitPage() {
  await connection();
  await requirePermission("social.manage");
  const kit = await getBrandKit();
  const ai = isAiConfigured();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link href="/cms/sosmed" className="text-xs text-charcoal/50 hover:text-brand">
          ← Antrian Sosmed
        </Link>
        <h1 className="mt-1 text-xl font-semibold">Brand Kit</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          Identitas yang tampil di setiap slide. Logo memakai logo resmi JabarNow!; warna mengikuti design token.
        </p>
      </div>

      <div className="rounded-[var(--radius-card)] border border-line bg-base p-4 text-sm">
        <p className="font-semibold">Penulis konten sosmed</p>
        <p className="mt-1 text-charcoal/60">
          {ai
            ? `AI aktif (${aiModelName()}): headline, alternatif, kata sorotan, isi slide, caption & hashtag ditulis AI dari artikel yang sudah disetujui.`
            : "AI belum dikonfigurasi. Konten disusun otomatis dari judul, ringkasan, dan paragraf awal artikel. Isi AI_PROVIDER, AI_API_KEY, dan AI_MODEL di .env untuk mengaktifkan AI."}
        </p>
      </div>

      <BrandKitForm
        initial={kit}
        templates={TEMPLATE_KEYS.map((key) => ({ key, name: TEMPLATE_LABELS[key].name }))}
      />
    </div>
  );
}
