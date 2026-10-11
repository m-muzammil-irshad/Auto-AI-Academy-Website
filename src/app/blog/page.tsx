import { Metadata } from "next";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { getPublishedPosts } from "@/lib/blogPublic";

// Keep in sync with BLOG_REVALIDATE_SECONDS in lib/blogPublic.ts.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog | Learn AI, Python, and Automation",
  description:
    "Practical, beginner-friendly guides and tutorials on Artificial Intelligence, Python, prompt engineering, and automation.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return <BlogIndex posts={posts} />;
}
