"use client";

import { FormEvent, ReactNode, useState } from "react";
import { EditorContent, Node, mergeAttributes, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import {
  Bold,
  Code2,
  Columns,
  ImageIcon,
  Italic,
  Lightbulb,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  MousePointerClick,
  Plus,
  Quote,
  Redo2,
  Rows,
  Table as TableIcon,
  Trash2,
  TriangleAlert,
  Undo2,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Tip / warning box. Matches <aside class="callout"> in the article styles. */
const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      variant: {
        default: "tip",
        parseHTML: (el) => (el.classList.contains("callout-warning") ? "warning" : "tip"),
        renderHTML: () => ({}),
      },
    };
  },
  parseHTML() {
    return [{ tag: "aside.callout" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const className = node.attrs.variant === "warning" ? "callout callout-warning" : "callout";
    return ["aside", mergeAttributes(HTMLAttributes, { class: className }), 0];
  },
});

/** Closing summary box. Matches <div class="takeaways"> in the article styles. */
const Takeaways = Node.create({
  name: "takeaways",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML() {
    return [{ tag: "div.takeaways" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { class: "takeaways" }), 0];
  },
});

/** Call-to-action button. Matches <div class="article-btn-wrap"><a href="..." class="article-btn">Text</a></div> */
const CtaButton = Node.create({
  name: "ctaButton",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      href: {
        default: "#",
        parseHTML: (el) => {
          const anchor = el.tagName.toLowerCase() === "a" ? el : el.querySelector("a");
          return anchor?.getAttribute("href") || "#";
        },
      },
      text: {
        default: "Click here",
        parseHTML: (el) => {
          const anchor = el.tagName.toLowerCase() === "a" ? el : el.querySelector("a");
          return anchor?.textContent?.trim() || el.textContent?.trim() || "Click here";
        },
      },
    };
  },
  parseHTML() {
    return [
      { tag: "div.article-btn-wrap" },
      { tag: "a.article-btn" },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      "div",
      { class: "article-btn-wrap" },
      [
        "a",
        mergeAttributes(HTMLAttributes, {
          href: node.attrs.href,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "article-btn",
        }),
        node.attrs.text || "Click here",
      ],
    ];
  },
});

/** Adds https:// when the author types a bare address such as "example.com". */
function normalizeUrl(raw: string): string {
  const url = raw.trim();
  if (!url) return "";
  return /^(https?:\/\/|mailto:|\/|#)/i.test(url) ? url : `https://${url}`;
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
  wide,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keep the text selection in the editor when a toolbar button is pressed.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-lg text-xs font-medium transition-colors disabled:opacity-40",
        wide ? "px-2.5" : "w-8",
        active
          ? "border border-slate-200/80 bg-slate-100 text-slate-900 font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
      )}
    >
      {children}
    </button>
  );
}

const Divider = () => <span aria-hidden="true" className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-800" />;

type Panel = "link" | "image" | "button" | null;

function Toolbar({ editor }: { editor: Editor }) {
  const [panel, setPanel] = useState<Panel>(null);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [btnText, setBtnText] = useState("");

  const openPanel = (next: Exclude<Panel, null>) => {
    if (panel === next) {
      setPanel(null);
      return;
    }
    if (next === "link") {
      setUrl((editor.getAttributes("link").href as string | undefined) ?? "");
    } else if (next === "button") {
      setUrl("");
      setBtnText("");
    } else {
      setUrl("");
      setAlt("");
    }
    setPanel(next);
  };

  const submitPanel = (e: FormEvent) => {
    e.preventDefault();
    const href = normalizeUrl(url);
    if (!href) return;
    if (panel === "link") {
      if (editor.state.selection.empty && !editor.isActive("link")) {
        // Nothing selected: insert the address itself as a clickable link.
        editor.chain().focus().insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] }).run();
      } else {
        editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
      }
    } else if (panel === "image") {
      editor.chain().focus().setImage({ src: href, alt: alt.trim() }).run();
    } else if (panel === "button") {
      const text = btnText.trim() || "Click here";
      editor.chain().focus().insertContent({
        type: "ctaButton",
        attrs: { href, text },
      }).run();
    }
    setPanel(null);
  };

  const isInsideTable = editor.isActive("table");

  const inputClass =
    "h-8 min-w-0 flex-1 rounded-lg border border-slate-200/80 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600";

  return (
    <div className="sticky top-14 z-20 rounded-t-xl border-b border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-[#0f1422]/95 backdrop-blur-md shadow-xs">
      <div className="flex flex-wrap items-center gap-1 p-2">
        {/* Text type: the three sizes an article is built from */}
        <ToolbarButton label="Normal text" wide active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}>
          Normal
        </ToolbarButton>
        <ToolbarButton label="Heading" wide active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          Heading
        </ToolbarButton>
        <ToolbarButton label="Subheading" wide active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          Subheading
        </ToolbarButton>
        <Divider />
        <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Add or edit link" active={editor.isActive("link") || panel === "link"} onClick={() => openPanel("link")}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton label="Remove link" onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}>
            <Unlink className="h-4 w-4" />
          </ToolbarButton>
        )}
        <ToolbarButton label="Insert button" active={panel === "button"} onClick={() => openPanel("button")}>
          <MousePointerClick className="h-4 w-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code2 className="h-4 w-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton label="Insert image" active={panel === "image"} onClick={() => openPanel("image")}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        {/* Table insert button */}
        <ToolbarButton
          label={isInsideTable ? "Table active" : "Insert table (3×3)"}
          active={isInsideTable}
          onClick={() => {
            if (!isInsideTable) {
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
            }
          }}
        >
          <TableIcon className="h-4 w-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton label="Tip box" active={editor.isActive("callout", { variant: "tip" })} onClick={() => editor.chain().focus().toggleWrap("callout", { variant: "tip" }).run()}>
          <Lightbulb className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Warning box" active={editor.isActive("callout", { variant: "warning" })} onClick={() => editor.chain().focus().toggleWrap("callout", { variant: "warning" }).run()}>
          <TriangleAlert className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Key takeaways box" active={editor.isActive("takeaways")} onClick={() => editor.chain().focus().toggleWrap("takeaways").run()}>
          <ListChecks className="h-4 w-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Contextual Table Editing Bar (visible when inside a table) */}
      {isInsideTable && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-200/80 dark:border-slate-800 px-3 py-1.5 bg-slate-50/80 dark:bg-slate-900/70 text-xs text-slate-700 dark:text-slate-300">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <TableIcon className="h-3.5 w-3.5 text-accent-500" />
            Table:
          </span>

          {/* Row actions */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium cursor-pointer"
            title="Add row below (or press Tab in last cell)"
          >
            <Plus className="h-3 w-3 text-emerald-500" />
            Row Below
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium cursor-pointer"
            title="Add row above"
          >
            <Plus className="h-3 w-3 text-emerald-500" />
            Row Above
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 text-xs font-medium cursor-pointer"
            title="Delete current row"
          >
            <Trash2 className="h-3 w-3 text-red-500" />
            Delete Row
          </button>

          <span className="mx-1 h-3.5 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Column actions */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium cursor-pointer"
            title="Add column right"
          >
            <Plus className="h-3 w-3 text-emerald-500" />
            Column Right
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium cursor-pointer"
            title="Add column left"
          >
            <Plus className="h-3 w-3 text-emerald-500" />
            Column Left
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 text-xs font-medium cursor-pointer"
            title="Delete current column"
          >
            <Trash2 className="h-3 w-3 text-red-500" />
            Delete Column
          </button>

          <span className="mx-1 h-3.5 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Header toggle & Delete entire table */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium cursor-pointer"
            title="Toggle top row as table header"
          >
            Header Row
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-red-200 bg-red-50/60 text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 text-xs font-medium cursor-pointer"
            title="Delete entire table"
          >
            <Trash2 className="h-3 w-3" />
            Delete Table
          </button>

          <span className="hidden sm:inline-block text-[11px] text-slate-400 dark:text-slate-500 ml-auto">
            ⌨️ Press Tab in last cell for new row
          </span>
        </div>
      )}

      {panel && (
        <form onSubmit={submitPanel} className="flex flex-wrap items-center gap-2 border-t border-slate-200/80 dark:border-slate-800 p-2.5">
          {panel === "button" ? (
            <>
              <input
                autoFocus
                type="text"
                value={btnText}
                onChange={(e) => setBtnText(e.target.value)}
                placeholder="Button text (e.g. Enroll in Free Course)"
                aria-label="Button text"
                required
                className={inputClass}
              />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Button link address (e.g. https://... or /courses)"
                aria-label="Button link address"
                required
                className={inputClass}
              />
              <button type="submit" className="h-8 rounded-lg bg-slate-900 px-3 text-xs font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white cursor-pointer">
                Insert button
              </button>
            </>
          ) : (
            <>
              <input
                autoFocus
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={panel === "link" ? "Paste or type a link, e.g. https://example.com" : "Paste the image address (https://...)"}
                aria-label={panel === "link" ? "Link address" : "Image address"}
                className={inputClass}
              />
              {panel === "image" && (
                <input
                  type="text"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Describe the image (for screen readers)"
                  aria-label="Image description"
                  className={inputClass}
                />
              )}
              <button type="submit" className="h-8 rounded-lg bg-slate-900 px-3 text-xs font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white cursor-pointer">
                {panel === "link" ? "Apply link" : "Insert image"}
              </button>
            </>
          )}
          <button type="button" onClick={() => setPanel(null)} className="h-8 rounded-lg border border-slate-200/80 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer">
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

export interface RichTextEditorProps {
  /** Starting HTML. Read once, when the editor mounts. */
  initialContent: string;
  onChange: (html: string) => void;
}

/**
 * Article editor. The writing area uses the same `.article` styles as the
 * public blog page, so headings, text, tables and images look the way readers will see them.
 */
export function RichTextEditor({ initialContent, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      // Typed or pasted addresses become clickable links automatically.
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      Placeholder.configure({ placeholder: "Start writing your article…" }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "article-table",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Callout,
      Takeaways,
      CtaButton,
    ],
    content: initialContent,
    editorProps: { attributes: { class: "article" } },
    onUpdate: ({ editor: current }) => onChange(current.isEmpty ? "" : current.getHTML()),
  });

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/50">
      {editor && <Toolbar editor={editor} />}
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
