/**
 * Deteksi tipe gambar dari isi file (magic bytes), bukan dari header browser
 * yang bisa dipalsukan. Mengembalikan MIME atau null bila tidak dikenali.
 */
export function sniffImageMime(buf: Uint8Array): string | null {
  const b = buf;
  const ascii = (start: number, len: number) =>
    String.fromCharCode(...b.subarray(start, start + len));

  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 8 && b[0] === 0x89 && ascii(1, 3) === "PNG") return "image/png";
  if (b.length >= 6 && (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a")) return "image/gif";
  if (b.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "image/webp";
  if (b.length >= 12 && ascii(4, 4) === "ftyp") {
    const brand = ascii(8, 4);
    if (brand === "avif" || brand === "avis") return "image/avif";
  }
  return null;
}
