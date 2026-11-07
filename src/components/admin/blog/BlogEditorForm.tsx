"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { RichTextEditor } from "@/components/admin/blog/RichTextEditor";
import { useAuth } from "@/hooks/useAuth";
import { readingTime, slugify } from "@/lib/blog";
import {
  createBlogPost,
  updateBlogPost,
  type BlogPostDoc,
  type BlogStatus,
} from "@/lib/services/blog";

const isHttpsUrl = (value: string) => /^https:\/\/\S+$/i.test(value.trim());

export interface BlogEditorFormProps {
  /** When present, the form edits this post instead of creating a new one. */
  post?: BlogPostDoc;
}

export function BlogEditorForm({ post }: BlogEditorFormProps) {
  const router = useRouter();
  const { profile } = useAuth();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  // Until the author edits the URL by hand, it follows the title.
  const [slugEdited, setSlugEdited] = useState(!!post);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [category, setCategory] = useState(post?.category ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [author, setAuthor] = useState(post?.author ?? "");
  const [content, setContent] = useState(post?.content ?? "");

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState<BlogStatus | null>(null);
  const [error, setError] = useState("");

  // New posts default to the signed-in admin as author.
  useEffect(() => {
    if (!post && profile?.name) setAuthor((current) => current || profile.name);
  }, [post, profile?.name]);

  // Warn before closing the tab with unsaved work.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const change = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setDirty(true);
  };

  const onTitleChange = (value: string) => {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
    setDirty(true);
  };

  async function save(status: BlogStatus) {
    setError("");
    const finalSlug = slugify(slug);

    if (title.trim().length < 3) return setError("Give the post a title of at least 3 characters.");
    if (!finalSlug) return setError("The post needs a URL. Use letters, numbers, and dashes.");
    if (coverImage.trim() && !isHttpsUrl(coverImage)) {
      return setError("The cover image must be a full address starting with https://");
    }
    if (status === "published") {
      if (!content.trim()) return setError("Write the article before publishing.");
      if (!excerpt.trim()) return setError("Add a short summary before publishing. It appears under the title and on the blog page.");
      if (!category.trim()) return setError("Add a category before publishing.");
      if (!coverImage.trim()) return setError("Add a cover image before publishing.");
      if (!author.trim()) return setError("Add the author's name before publishing.");
    }

    const input = { title, slug: finalSlug, excerpt, content, category, coverImage, author, status };
    setSaving(status);
    try {
      if (post) {
        await updateBlogPost(post, input);
      } else {
        await createBlogPost(input);
      }
      setDirty(false);
      router.push("/admin/blog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the post.");
      setSaving(null);
    }
  }

  const isPublished = post?.status === "published";
  const busy = saving !== null;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors duration-150 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All posts
        </Link>
        <div className="flex items-center gap-3">
          {post && (
            <Badge variant={isPublished ? "success" : "neutral"} className="neu-flat border-none shadow-sm font-bold">
              {isPublished ? "Published" : "Draft"}
            </Badge>
          )}
          <Button variant="secondary" onClick={() => save("draft")} loading={saving === "draft"} disabled={busy} className="rounded-full neu-btn font-semibold">
            {isPublished ? "Unpublish to draft" : "Save draft"}
          </Button>
          <Button onClick={() => save("published")} loading={saving === "published"} disabled={busy} className="neu-btn-primary rounded-full font-bold">
            {isPublished ? "Update post" : "Publish"}
          </Button>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-6 animate-shake rounded-2xl neu-pressed-sm p-4 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Writing area */}
        <div className="min-w-0 space-y-5">
          <textarea
            value={title}
            onChange={(e) => onTitleChange(e.target.value.replace(/\n/g, " "))}
            placeholder="Post title"
            aria-label="Post title"
            rows={1}
            disabled={busy}
            className="block w-full resize-none border-0 bg-transparent p-0 font-heading text-3xl font-bold leading-tight tracking-tight text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-slate-600 sm:text-4xl [field-sizing:content]"
          />
          <RichTextEditor initialContent={post?.content ?? ""} onChange={change(setContent)} />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {content ? readingTime(content) : "Reading time appears once you start writing."} · The writing area shows the text exactly as readers will see it.
          </p>
        </div>

        {/* Post settings */}
        <aside className="space-y-5 xl:sticky xl:top-20 xl:self-start">
          <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/50 space-y-4 p-5 sm:p-6">
            <h2 className="font-heading text-base font-semibold text-slate-900 dark:text-white">Post details</h2>
            <Textarea
              label="Summary"
              value={excerpt}
              onChange={(e) => change(setExcerpt)(e.target.value)}
              rows={3}
              hint="One or two sentences. Shown under the title and on the blog page."
              disabled={busy}
            />
            <Input
              label="Category"
              value={category}
              onChange={(e) => change(setCategory)(e.target.value)}
              placeholder="e.g. Python"
              disabled={busy}
            />
            <Input
              label="Author"
              value={author}
              onChange={(e) => change(setAuthor)(e.target.value)}
              disabled={busy}
            />
            <Input
              label="Post URL"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugEdited(true);
                setDirty(true);
              }}
              hint={`/blog/${slugify(slug) || "your-post-title"}`}
              disabled={busy}
            />
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/50 space-y-4 p-5 sm:p-6">
            <h2 className="font-heading text-base font-semibold text-slate-900 dark:text-white">Cover image</h2>
            <Input
              label="Image address"
              type="url"
              value={coverImage}
              onChange={(e) => change(setCoverImage)(e.target.value)}
              placeholder="https://..."
              hint="A wide image works best (16:9, about 1600 × 900)."
              disabled={busy}
            />
            {isHttpsUrl(coverImage) && (
              <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 p-1 overflow-hidden">
                {/* Plain <img>: this is only a preview of whatever address was pasted. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage.trim()} alt="Cover preview" className="aspect-video w-full rounded-md object-cover" />
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
