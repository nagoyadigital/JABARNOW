import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed artikel CONTOH (PUBLISHED) agar homepage & arsip tampil berisi untuk demo.
 * Konten placeholder editorial — ganti/hapus kapan saja. Idempoten via slug.
 * Jalankan: npx tsx prisma/seed-articles.ts
 */

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Bangun konten Tiptap JSON sederhana dari array paragraf + 1 heading.
function doc(paras: string[]) {
  return {
    type: "doc",
    content: [
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Latar Belakang" }] },
      ...paras.map((p) => ({
        type: "paragraph",
        content: [{ type: "text", text: p }],
      })),
    ],
  };
}

const PARAS = [
  "Ini contoh isi artikel untuk demonstrasi tampilan JabarNow!. Teks berikut adalah placeholder editorial dan dapat disunting melalui CMS.",
  "Paragraf kedua menjelaskan konteks berita secara ringkas. Redaksi dapat menambahkan kutipan, gambar, tabel, dan tautan melalui block editor.",
  "Paragraf penutup menegaskan poin utama. Pada produksi, konten berasal dari redaksi dan dirender sebagai HTML tersanitasi.",
];

type Spec = {
  title: string;
  category: string; // slug kategori
  region?: string; // slug wilayah
  hoursAgo: number;
};

const ARTICLES: Spec[] = [
  { title: "Pemprov Jabar Percepat Pembangunan Infrastruktur Jalan Daerah", category: "berita", region: "kota-bandung", hoursAgo: 1 },
  { title: "Ekonomi Kreatif Bandung Tumbuh Pesat Sepanjang Kuartal Ini", category: "ekonomi", region: "kota-bandung", hoursAgo: 3 },
  { title: "Persib Siapkan Strategi Baru Jelang Laga Kandang", category: "olahraga", region: "kabupaten-bandung", hoursAgo: 5 },
  { title: "Startup Teknologi Asal Bekasi Raih Pendanaan Tahap Awal", category: "teknologi", region: "kota-bekasi", hoursAgo: 7 },
  { title: "Pemkot Bogor Luncurkan Program Wisata Ramah Keluarga", category: "gaya-hidup", region: "kota-bogor", hoursAgo: 10 },
  { title: "Dinas Pendidikan Jabar Dorong Digitalisasi Sekolah", category: "pendidikan", region: "kota-depok", hoursAgo: 14 },
  { title: "Harga Komoditas Pangan di Pasar Tradisional Mulai Stabil", category: "ekonomi", region: "kabupaten-bogor", hoursAgo: 20 },
  { title: "Festival Budaya Sunda Digelar Akhir Pekan Ini", category: "gaya-hidup", region: "kota-bandung", hoursAgo: 28 },
  { title: "Pemkab Garut Tingkatkan Layanan Kesehatan Masyarakat", category: "kesehatan", region: "kabupaten-garut", hoursAgo: 36 },
  { title: "Pembangunan Transportasi Publik Terintegrasi Dikebut", category: "berita", region: "kota-bandung", hoursAgo: 50 },
];

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
    select: { id: true },
  });
  if (!admin) {
    console.error("Tidak ada Super Admin. Jalankan `npm run db:seed` dulu.");
    process.exit(1);
  }

  for (const spec of ARTICLES) {
    const slug = slugify(spec.title);
    const category = await prisma.category.findUnique({ where: { slug: spec.category } });
    const region = spec.region
      ? await prisma.region.findUnique({ where: { slug: spec.region } })
      : null;

    const publishedAt = new Date(Date.now() - spec.hoursAgo * 3600_000);

    // Cover DEMO dari picsum (deterministik via seed = slug). Ganti via CMS nanti.
    const coverUrl = `https://picsum.photos/seed/${slug}/1200/675`;
    const storageKey = `demo/${slug}.jpg`;
    const cover = await prisma.mediaAsset.upsert({
      where: { storageKey },
      update: { url: coverUrl },
      create: {
        storageKey,
        url: coverUrl,
        fileName: `${slug}.jpg`,
        mimeType: "image/jpeg",
        sizeBytes: 0,
        width: 1200,
        height: 675,
        alt: spec.title,
        uploaderId: admin.id,
      },
    });

    await prisma.article.upsert({
      where: { slug },
      update: {
        status: "PUBLISHED",
        publishedAt,
        categoryId: category?.id ?? null,
        regionId: region?.id ?? null,
        coverMediaId: cover.id,
        coverAlt: spec.title,
      },
      create: {
        slug,
        title: spec.title,
        excerpt:
          "Ringkasan berita contoh untuk pratinjau tampilan. Konten akan diganti oleh redaksi melalui CMS.",
        contentJson: doc(PARAS),
        status: "PUBLISHED",
        publishedAt,
        authorId: admin.id,
        categoryId: category?.id ?? null,
        regionId: region?.id ?? null,
        coverMediaId: cover.id,
        coverAlt: spec.title,
        seoTitle: spec.title,
        seoDescription:
          "Berita contoh JabarNow! untuk pratinjau tampilan homepage dan detail artikel.",
      },
    });
    console.log(`✔ ${spec.title}`);
  }

  console.log(`\nSelesai: ${ARTICLES.length} artikel contoh (PUBLISHED).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
