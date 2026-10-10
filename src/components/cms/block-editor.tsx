"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { useCallback } from "react";
import type { JSONContent } from "@tiptap/react";

/**
 * BlockEditor — editor blok (Tiptap): paragraph, H2/H3, bold/italic, link,
 * quote, list, image, table. Paste disanitasi di server sebelum simpan.
 */
export function BlockEditor({
  initialContent,
  onChange,
}: {
  initialContent?: JSONContent;
  onChange: (json: JSONContent) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      TableKit.configure({ table: { resizable: false } }),
    ],
    content: initialContent ?? { type: "doc", content: [] },
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[320px] rounded-b-md border border-t-0 border-line bg-base px-4 py-3 outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL tautan:");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL gambar (dari Media Library):");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    `rounded px-2 py-1 text-sm font-medium transition-colors ${
      active ? "bg-brand text-white" : "text-charcoal/70 hover:bg-muted"
    }`;

  return (
    <div>
      {/* Toolbar (dapat discroll di mobile) */}
      <div className="flex flex-wrap gap-1 overflow-x-auto rounded-t-md border border-line bg-muted p-2">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}>
          B
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}>
          <span className="italic">I</span>
        </button>
        <span className="mx-1 w-px bg-line" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}>
          H3
        </button>
        <span className="mx-1 w-px bg-line" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>
          • List
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>
          1. List
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))}>
          &quot;
        </button>
        <span className="mx-1 w-px bg-line" />
        <button type="button" onClick={addLink} className={btn(editor.isActive("link"))}>
          Link
        </button>
        <button type="button" onClick={addImage} className={btn(false)}>
          Gambar
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className={btn(false)}
        >
          Tabel
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
