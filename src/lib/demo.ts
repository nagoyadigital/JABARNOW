/**
 * Saklar mode demo.
 * - Konten contoh (sample-content) hanya tampil di development, atau bila
 *   NEXT_PUBLIC_DEMO_CONTENT=1. Di produksi tanpa artikel, situs menampilkan
 *   keadaan kosong — tidak pernah berita palsu.
 * - Kotak pratinjau "Area Iklan" hanya tampil di development, atau bila
 *   NEXT_PUBLIC_ADS_PREVIEW=1. Di produksi hanya kampanye aktif yang tampil.
 */
const isProd = process.env.NODE_ENV === "production";

export const DEMO_CONTENT =
  process.env.NEXT_PUBLIC_DEMO_CONTENT === "1" ||
  (!isProd && process.env.NEXT_PUBLIC_DEMO_CONTENT !== "0");

export const ADS_PREVIEW =
  process.env.NEXT_PUBLIC_ADS_PREVIEW === "1" ||
  (!isProd && process.env.NEXT_PUBLIC_ADS_PREVIEW !== "0");
