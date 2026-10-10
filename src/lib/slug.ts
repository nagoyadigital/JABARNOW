/**
 * Util slug — URL bersih & unik.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** Tambahkan sufiks pendek bila slug sudah dipakai (dipakai di server action). */
export function withSuffix(base: string, suffix: number): string {
  return `${base}-${suffix}`;
}
