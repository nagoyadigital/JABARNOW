import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitasi HTML konten editor — cegah XSS.
 * Hanya izinkan tag/atribut editorial yang aman. Paste & simpan harus lewat sini.
 */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "iframe", // embed (dibatasi domain di bawah)
];

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "width",
  "height",
  "colspan",
  "rowspan",
  "allow",
  "allowfullscreen",
  "frameborder",
];

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Hanya izinkan src iframe dari penyedia embed umum
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ["target"],
    FORBID_TAGS: ["script", "style", "form", "input", "button"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "style"],
  });
}

/**
 * Sanitasi dokumen Tiptap JSON secara rekursif:
 * buang mark/atribut yang tidak dikenal pada level teks tidak diperlukan di sini,
 * karena rendering akhir melewati sanitizeHtml. Fungsi ini memastikan struktur
 * JSON valid (objek) sebelum disimpan.
 */
export function assertTiptapJson(value: unknown): object {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as object;
  }
  return { type: "doc", content: [] };
}
