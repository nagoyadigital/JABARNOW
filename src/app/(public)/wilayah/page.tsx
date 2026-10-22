import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/public/section-heading";

export const instant = false;

export const metadata: Metadata = {
  title: "Wilayah Jawa Barat",
  description: "Jelajahi berita dari 27 kabupaten/kota di Jawa Barat.",
};

/**
 * Direktori Wilayah — daftar 27 kab/kota. DIIZINKAN di halaman ini
 * (bukan di homepage). Fallback aman bila DB belum tersambung.
 */
async function loadRegions() {
  try {
    return await prisma.region.findMany({
      select: { slug: true, name: true, type: true },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
  } catch {
    return [];
  }
}

export default async function WilayahIndexPage() {
  // Render saat request: build tidak bergantung pada database yang menyala
  await connection();
  const regions = await loadRegions();
  const kota = regions.filter((r) => r.type === "KOTA");
  const kabupaten = regions.filter((r) => r.type === "KABUPATEN");

  return (
    <div className="container-jn py-8">
      <SectionHeading title="Wilayah Jawa Barat" />
      {regions.length === 0 ? (
        <p className="text-sm text-charcoal/60">
          Daftar wilayah akan tampil setelah database tersambung &amp; di-seed.
        </p>
      ) : (
        <div className="space-y-8">
          <RegionGroup title="Kota" items={kota} />
          <RegionGroup title="Kabupaten" items={kabupaten} />
        </div>
      )}
    </div>
  );
}

function RegionGroup({
  title,
  items,
}: {
  title: string;
  items: { slug: string; name: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal/50">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((r) => (
          <Link
            key={r.slug}
            href={`/wilayah/${r.slug}`}
            className="rounded-[var(--radius-card)] border border-line bg-base px-4 py-3 text-sm font-medium transition-colors hover:border-brand hover:text-brand"
          >
            {r.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
