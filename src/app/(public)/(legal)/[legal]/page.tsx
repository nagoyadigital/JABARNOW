import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const instant = false;

/**
 * Halaman informasi legal (privasi, syarat, disclaimer, pedoman).
 * Konten final dikelola via CMS; ini kerangka + placeholder editorial.
 */
const LEGAL: Record<string, { title: string; intro: string }> = {
  privasi: {
    title: "Kebijakan Privasi",
    intro: "Kebijakan privasi JabarNow! menjelaskan bagaimana data pengunjung dikelola.",
  },
  syarat: {
    title: "Syarat & Ketentuan",
    intro: "Syarat dan ketentuan penggunaan layanan JabarNow!.",
  },
  disclaimer: {
    title: "Disclaimer",
    intro: "Pernyataan penafian terkait konten di JabarNow!.",
  },
  pedoman: {
    title: "Pedoman Media Siber",
    intro: "JabarNow! berkomitmen pada Pedoman Media Siber.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ legal: string }>;
}): Promise<Metadata> {
  const { legal } = await params;
  const data = LEGAL[legal];
  return { title: data?.title ?? "Informasi" };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ legal: string }>;
}) {
  const { legal } = await params;
  const data = LEGAL[legal];
  if (!data) notFound();

  return (
    <div className="container-jn py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold">{data.title}</h1>
        <p className="mt-4 text-charcoal/80">{data.intro}</p>
        <p className="mt-2 text-sm text-charcoal/50">
          Konten lengkap akan dikelola melalui CMS. Teks ini placeholder editorial.
        </p>
      </div>
    </div>
  );
}
