"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PostCard, PostMeta } from "@/components/blog/PostCard";
import { SHIMMER_BLUR_16_9 } from "@/lib/imageBlur";
import { DURATION, EASE } from "@/lib/motion";
import type { BlogPost } from "@/lib/blogData";

interface BlogIndexProps {
  posts: BlogPost[];
  categories?: string[];
}

export function BlogIndex({ posts, categories }: BlogIndexProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categoryList = categories && categories.length > 0
    ? categories
    : ["All", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];

  const filteredPosts = activeCategory === "All"
    ? posts
    : posts.filter(post => post.category === activeCategory);

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#090c15] text-slate-900 dark:text-slate-100 transition-colors duration-150">
      <SiteHeader />

      <main className="flex-1 w-full mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-16">

        {/* Header Section */}
        <div className="mb-8 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-3 py-1 text-xs text-slate-600 dark:text-slate-400">
            <span>Tutorials and guides</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-medium tracking-tight text-slate-900 dark:text-white mb-3">
            Articles on programming and AI
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Hands-on tutorials, architecture overviews, and step-by-step guides for developers.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="mb-8 flex items-center gap-1.5 overflow-x-auto p-1 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 w-fit max-w-full">
          {categoryList.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
              className={`whitespace-nowrap px-3 py-1 rounded-md text-xs transition-colors ${
                activeCategory === category
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.ui, ease: EASE }}
        >
          {/* Featured Post */}
          {featuredPost && (
            <article className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 sm:p-6 mb-12 grid items-center gap-6 md:grid-cols-5 md:gap-8 shadow-sm">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="relative block aspect-video w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-950 md:col-span-3"
              >
                <Image
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  fill
                  placeholder="blur"
                  blurDataURL={SHIMMER_BLUR_16_9}
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover"
                  priority
                />
              </Link>
              <div className="md:col-span-2">
                <p className="mb-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  Featured &middot; {featuredPost.category}
                </p>
                <h2 className="mb-3 font-heading text-xl md:text-2xl font-medium leading-snug text-slate-900 dark:text-white">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {featuredPost.title}
                  </Link>
                </h2>
                <p className="mb-5 line-clamp-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {featuredPost.excerpt}
                </p>
                <PostMeta post={featuredPost} size="md" />
              </div>
            </article>
          )}

          {/* Grid of Regular Posts */}
          {regularPosts.length > 0 && (
            <>
              <h2 className="mb-6 font-heading text-lg font-medium text-slate-900 dark:text-white">
                All articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </>
          )}
        </motion.div>

      </main>
      <SiteFooter />
    </div>
  );
}
