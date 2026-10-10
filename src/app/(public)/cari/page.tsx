import type { Metadata } from "next";
import { searchPublished } from "@/lib/articles";
import { ArticleArchiveList } from "@/components/public/article-list";
import { SectionHeading } from "@/components/public/section-heading";

export const instant = false;

export const metadata: Metadata = {
  title: "Pencarian",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const items = q ? await searchPublished(q) : [];

  return (
    <div className="container-jn py-8">
      <form action="/cari" className="mb-6">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Cari berita..."
          className="w-full max-w-xl rounded-md border border-line bg-base px-4 py-2.5 text-sm outline-none focus-visible:border-brand"
          aria-label="Kata kunci pencarian"
        />
      </form>

      {q ? (
        <>
          <SectionHeading title={`Hasil untuk "${q}"`} />
          <ArticleArchiveList
            items={items}
            emptyText={`Tidak ada hasil untuk "${q}".`}
          />
        </>
      ) : (
        <p className="text-sm text-charcoal/60">
          Ketik kata kunci untuk mencari berita.
        </p>
      )}
    </div>
  );
}
