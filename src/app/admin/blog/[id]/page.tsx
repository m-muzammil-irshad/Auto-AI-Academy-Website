"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BlogEditorForm } from "@/components/admin/blog/BlogEditorForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchBlogPost, type BlogPostDoc } from "@/lib/services/blog";

export default function AdminEditBlogPostPage() {
  const params = useParams();
  const id = params?.id as string;

  const [post, setPost] = useState<BlogPostDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchBlogPost(id)
      .then((found) => {
        if (found) setPost(found);
        else setError("This post no longer exists.");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load the post."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-5">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-[28rem] w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !post) {
    return <EmptyState title="Post not found" description={error} />;
  }

  // The editor reads its starting content once, so mount it only after the post has loaded.
  return <BlogEditorForm post={post} />;
}
