import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import type { JSONContent } from "@tiptap/react";
import { sanitizeHtml } from "@/lib/sanitize";

/**
 * Render konten Tiptap JSON → HTML tersanitasi untuk tampilan publik.
 * Sanitasi wajib: cegah XSS dari konten tersimpan.
 */
export function renderArticleHtml(json: unknown): string {
  if (!json || typeof json !== "object") return "";
  try {
    const html = generateHTML(json as JSONContent, [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link,
      Image,
      TableKit,
    ]);
    return sanitizeHtml(html);
  } catch {
    return "";
  }
}
