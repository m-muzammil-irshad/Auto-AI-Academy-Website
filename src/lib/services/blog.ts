import {
  Timestamp,
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { blogPostDoc, blogPostsCol } from "@/lib/firebase/collections";
import { blogPosts as starterPosts } from "@/lib/blogData";

// Admin-side blog access (drafts included). The public site reads published
// posts through lib/blogPublic.ts instead.

export type BlogStatus = "draft" | "published";

export interface BlogPostDoc {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  /** Article body as HTML, produced by the admin editor. */
  content: string;
  category: string;
  coverImage: string;
  author: string;
  status: BlogStatus;
  /** Set the first time the post is published; kept if it goes back to draft. */
  publishedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type BlogPostInput = Pick<
  BlogPostDoc,
  "title" | "slug" | "excerpt" | "content" | "category" | "coverImage" | "author" | "status"
>;

function mapPost(id: string, data: Record<string, unknown>): BlogPostDoc {
  return {
    id,
    title: (data.title as string) ?? "",
    slug: (data.slug as string) ?? "",
    excerpt: (data.excerpt as string) ?? "",
    content: (data.content as string) ?? "",
    category: (data.category as string) ?? "",
    coverImage: (data.coverImage as string) ?? "",
    author: (data.author as string) ?? "",
    status: (data.status as BlogStatus) ?? "draft",
    publishedAt: (data.publishedAt as Timestamp | null) ?? null,
    createdAt: (data.createdAt as Timestamp) ?? Timestamp.now(),
    updatedAt: (data.updatedAt as Timestamp) ?? Timestamp.now(),
  };
}

export async function fetchAllBlogPosts(): Promise<BlogPostDoc[]> {
  const snap = await getDocs(blogPostsCol());
  return snap.docs
    .map((d) => mapPost(d.id, d.data()))
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}

export async function fetchBlogPost(id: string): Promise<BlogPostDoc | null> {
  const snap = await getDoc(blogPostDoc(id));
  if (!snap.exists()) return null;
  return mapPost(snap.id, snap.data());
}

/** Slugs are the public URL, so two posts must never share one. */
async function assertSlugFree(slug: string, exceptId?: string): Promise<void> {
  const snap = await getDocs(query(blogPostsCol(), where("slug", "==", slug)));
  if (snap.docs.some((d) => d.id !== exceptId)) {
    throw new Error(`Another post already uses the URL "${slug}". Choose a different one.`);
  }
}

function clean(input: BlogPostInput) {
  return {
    title: input.title.trim(),
    slug: input.slug.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content,
    category: input.category.trim(),
    coverImage: input.coverImage.trim(),
    author: input.author.trim(),
    status: input.status,
  };
}

export async function createBlogPost(input: BlogPostInput): Promise<string> {
  await assertSlugFree(input.slug.trim());
  const ref = await addDoc(blogPostsCol(), {
    ...clean(input),
    publishedAt: input.status === "published" ? serverTimestamp() : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBlogPost(existing: BlogPostDoc, input: BlogPostInput): Promise<void> {
  await assertSlugFree(input.slug.trim(), existing.id);
  const firstPublish = input.status === "published" && !existing.publishedAt;
  await updateDoc(blogPostDoc(existing.id), {
    ...clean(input),
    ...(firstPublish ? { publishedAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBlogPost(id: string): Promise<void> {
  await deleteDoc(blogPostDoc(id));
}

/** Copies the built-in starter posts into the database so they can be edited. Skips slugs that already exist. */
export async function importStarterPosts(): Promise<number> {
  const existing = new Set((await fetchAllBlogPosts()).map((p) => p.slug));
  const missing = starterPosts.filter((post) => !existing.has(post.slug));
  await Promise.all(
    missing.map((post) => {
      const published = Timestamp.fromDate(new Date(post.date));
      return addDoc(blogPostsCol(), {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content.trim(),
        category: post.category,
        coverImage: post.coverImage,
        author: post.author,
        status: "published",
        publishedAt: published,
        createdAt: published,
        updatedAt: serverTimestamp(),
      });
    })
  );
  return missing.length;
}
