import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed data awal JabarNow!:
 * - 27 kabupaten/kota Jawa Barat
 * - kategori dasar
 * - Super Admin pertama (kredensial dari env, bukan hardcoded di repo)
 */

// 27 kabupaten/kota Provinsi Jawa Barat
const REGIONS: { name: string; type: "KOTA" | "KABUPATEN" }[] = [
  { name: "Kota Bandung", type: "KOTA" },
  { name: "Kota Banjar", type: "KOTA" },
  { name: "Kota Bekasi", type: "KOTA" },
  { name: "Kota Bogor", type: "KOTA" },
  { name: "Kota Cimahi", type: "KOTA" },
  { name: "Kota Cirebon", type: "KOTA" },
  { name: "Kota Depok", type: "KOTA" },
  { name: "Kota Sukabumi", type: "KOTA" },
  { name: "Kota Tasikmalaya", type: "KOTA" },
  { name: "Kabupaten Bandung", type: "KABUPATEN" },
  { name: "Kabupaten Bandung Barat", type: "KABUPATEN" },
  { name: "Kabupaten Bekasi", type: "KABUPATEN" },
  { name: "Kabupaten Bogor", type: "KABUPATEN" },
  { name: "Kabupaten Ciamis", type: "KABUPATEN" },
  { name: "Kabupaten Cianjur", type: "KABUPATEN" },
  { name: "Kabupaten Cirebon", type: "KABUPATEN" },
  { name: "Kabupaten Garut", type: "KABUPATEN" },
  { name: "Kabupaten Indramayu", type: "KABUPATEN" },
  { name: "Kabupaten Karawang", type: "KABUPATEN" },
  { name: "Kabupaten Kuningan", type: "KABUPATEN" },
  { name: "Kabupaten Majalengka", type: "KABUPATEN" },
  { name: "Kabupaten Pangandaran", type: "KABUPATEN" },
  { name: "Kabupaten Purwakarta", type: "KABUPATEN" },
  { name: "Kabupaten Subang", type: "KABUPATEN" },
  { name: "Kabupaten Sukabumi", type: "KABUPATEN" },
  { name: "Kabupaten Sumedang", type: "KABUPATEN" },
  { name: "Kabupaten Tasikmalaya", type: "KABUPATEN" },
];

const CATEGORIES = [
  "Berita",
  "Politik",
  "Ekonomi",
  "Olahraga",
  "Teknologi",
  "Gaya Hidup",
  "Pendidikan",
  "Kesehatan",
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function main() {
  console.log("Seeding regions (27 kab/kota)...");
  for (const r of REGIONS) {
    await prisma.region.upsert({
      where: { slug: slugify(r.name) },
      update: {},
      create: { slug: slugify(r.name), name: r.name, type: r.type },
    });
  }

  console.log("Seeding categories...");
  for (const name of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { slug: slugify(name), name },
    });
  }

  // Super Admin pertama — kredensial dari env (jangan hardcode di repo)
  const email = process.env.SEED_SUPERADMIN_EMAIL;
  const password = process.env.SEED_SUPERADMIN_PASSWORD;
  if (email && password) {
    console.log(`Seeding Super Admin: ${email}`);
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.upsert({
      where: { email },
      update: { role: "SUPER_ADMIN", isStaff: true, status: "ACTIVE" },
      create: {
        email,
        name: "Super Admin",
        passwordHash,
        role: "SUPER_ADMIN",
        isStaff: true,
        status: "ACTIVE",
      },
    });
  } else {
    console.log(
      "Lewati Super Admin: set SEED_SUPERADMIN_EMAIL & SEED_SUPERADMIN_PASSWORD untuk membuatnya.",
    );
  }

  console.log("Seed selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
