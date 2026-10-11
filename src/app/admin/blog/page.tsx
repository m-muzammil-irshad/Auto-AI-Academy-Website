"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils/dates";
import {
  deleteBlogPost,
  fetchAllBlogPosts,
  importStarterPosts,
  type BlogPostDoc,
} from "@/lib/services/blog";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogPostDoc | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function reload() {
    setLoading(true);
    setError("");
    try {
      setPosts(await fetchAllBlogPosts());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load posts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  async function handleImport() {
    setImporting(true);
    setError("");
    try {
      await importStarterPosts();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import the starter posts.");
    } finally {
      setImporting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");
    try {
      await deleteBlogPost(deleteTarget.id);
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the post.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl text-slate-900 dark:text-white">
            Blog
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Write, publish, and edit articles. Published changes reach the site within a minute.
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button>New post</Button>
        </Link>
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card-surface p-4">
              <Skeleton className="mb-2 h-5 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        !error && (
          <EmptyState
            title="No posts in the database yet"
            description="The public blog is currently showing the three built-in starter posts. Import them to edit them here, or start a new post."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="secondary" onClick={handleImport} loading={importing}>
                  Import starter posts
                </Button>
                <Link href="/admin/blog/new">
                  <Button>New post</Button>
                </Link>
              </div>
            }
          />
        )
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const published = post.status === "published";
            return (
              <Card key={post.id}>
                <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-base font-semibold text-slate-900 dark:text-white">
                        {post.title || "Untitled post"}
                      </h3>
                      <Badge variant={published ? "success" : "neutral"}>
                        {published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {post.category || "No category"} · {post.author || "No author"} ·{" "}
                      {published && post.publishedAt
                        ? `Published ${formatDate(post.publishedAt)}`
                        : `Last edited ${formatDate(post.updatedAt)}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {published && (
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">View</Button>
                      </a>
                    )}
                    <Link href={`/admin/blog/${post.id}`}>
                      <Button variant="secondary" size="sm">Edit</Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => setDeleteTarget(post)}>
                      Delete
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={deleting ? () => {} : () => setDeleteTarget(null)}
        title="Delete post?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            This will permanently delete <strong>{deleteTarget?.title || "this post"}</strong>. This action cannot be undone.
          </p>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Yes, delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
