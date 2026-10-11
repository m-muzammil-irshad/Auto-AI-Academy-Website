"use client";

import { FormEvent, ReactNode, useState } from "react";
import { EditorContent, Node, mergeAttributes, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Code2,
  ImageIcon,
  Italic,
  Lightbulb,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Quote,
  Redo2,
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
        "inline-flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150 disabled:opacity-40",
        wide ? "px-3" : "w-9",
        active
          ? "bg-accent-600 text-white dark:bg-accent-500"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      )}
    >
      {children}
    </button>
  );
}

const Divider = () => <span aria-hidden="true" className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />;

type Panel = "link" | "image" | null;

function Toolbar({ editor }: { editor: Editor }) {
  const [panel, setPanel] = useState<Panel>(null);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");

  const openPanel = (next: Exclude<Panel, null>) => {
    setUrl(next === "link" ? (editor.getAttributes("link").href as string | undefined) ?? "" : "");
    setAlt("");
    setPanel(panel === next ? null : next);
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
    }
    setPanel(null);
  };

  const inputClass =
    "h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

  return (
    <div className="sticky top-16 z-20 rounded-t-2xl border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
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

      {panel && (
        <form onSubmit={submitPanel} className="flex flex-wrap items-center gap-2 border-t border-slate-200 p-2 dark:border-slate-800">
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
          <button type="submit" className="h-9 rounded-lg bg-accent-600 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-700">
            {panel === "link" ? "Apply link" : "Insert image"}
          </button>
          <button type="button" onClick={() => setPanel(null)} className="h-9 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
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
 * public blog page, so headings, text and images look the way readers will see them.
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
      Callout,
      Takeaways,
    ],
    content: initialContent,
    editorProps: { attributes: { class: "article" } },
    onUpdate: ({ editor: current }) => onChange(current.isEmpty ? "" : current.getHTML()),
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      {editor && <Toolbar editor={editor} />}
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
