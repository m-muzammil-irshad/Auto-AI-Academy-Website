import { blogPosts as starterPosts, type BlogPost } from "@/lib/blogData";

// Server-side reads of published posts for the public blog pages.
// Uses Firestore's REST API rather than the client SDK so pages can be
// rendered and cached on the server (good for SEO) without initialising auth.

/** How long the public blog pages may serve a cached copy, in seconds. */
export const BLOG_REVALIDATE_SECONDS = 60;

type FirestoreValue = { stringValue?: string; timestampValue?: string };
type FirestoreDocument = { name: string; fields?: Record<string, FirestoreValue> };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function toPost(doc: FirestoreDocument): (BlogPost & { publishedAt: string }) | null {
  const f = doc.fields ?? {};
  const publishedAt = f.publishedAt?.timestampValue;
  const slug = f.slug?.stringValue;
  if (!publishedAt || !slug) return null;
  return {
    id: doc.name.split("/").pop() ?? slug,
    slug,
    title: f.title?.stringValue ?? "",
    excerpt: f.excerpt?.stringValue ?? "",
    content: f.content?.stringValue ?? "",
    author: f.author?.stringValue ?? "",
    category: f.category?.stringValue ?? "",
    coverImage: f.coverImage?.stringValue ?? "",
    date: formatDate(publishedAt),
    publishedAt,
  };
}

/**
 * Published posts, newest first.
 * Falls back to the built-in starter posts when the database has none yet
 * or cannot be reached, so the blog is never empty.
 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Security rules only allow public reads that filter on published status.
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: "blogPosts" }],
            where: {
              fieldFilter: {
                field: { fieldPath: "status" },
                op: "EQUAL",
                value: { stringValue: "published" },
              },
            },
          },
        }),
        next: { revalidate: BLOG_REVALIDATE_SECONDS },
      }
    );
    if (!res.ok) throw new Error(`Firestore responded ${res.status}`);

    const rows = (await res.json()) as { document?: FirestoreDocument }[];
    const posts = rows
      .map((row) => (row.document ? toPost(row.document) : null))
      .filter((post): post is BlogPost & { publishedAt: string } => !!post)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

    if (posts.length > 0) return posts.map(({ publishedAt: _publishedAt, ...post }) => post);
  } catch (err) {
    // Expected (403) until the blogPosts security rules are deployed.
    console.warn(
      "Could not load blog posts from Firestore; showing starter posts:",
      err instanceof Error ? err.message : err
    );
  }
  return starterPosts;
}

export async function getPublishedPost(slug: string): Promise<BlogPost | undefined> {
  return (await getPublishedPosts()).find((post) => post.slug === slug);
}
