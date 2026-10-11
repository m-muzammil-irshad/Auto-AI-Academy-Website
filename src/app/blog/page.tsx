import { Metadata } from "next";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { getPublishedPosts } from "@/lib/blogPublic";
import { DEFAULT_OG_IMAGE, seoAlternates } from "@/lib/seo";

// Keep in sync with BLOG_REVALIDATE_SECONDS in lib/blogPublic.ts.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog: AI, Python & Automation Tutorials",
  description:
    "Practical, beginner-friendly guides and tutorials on Artificial Intelligence, Python, prompt engineering, and automation.",
  alternates: seoAlternates("/blog"),
  openGraph: {
    title: "Blog: AI, Python & Automation Tutorials | Auto AI Academy",
    url: "/blog",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return <BlogIndex posts={posts} />;
}
