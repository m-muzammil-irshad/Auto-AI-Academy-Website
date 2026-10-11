"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PostCard, PostMeta } from "@/components/blog/PostCard";
import type { BlogPost } from "@/lib/blogData";
import { DURATION, EASE } from "@/lib/motion";

export function BlogIndex({ posts }: { posts: BlogPost[] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(posts.map(post => post.category)))];

  const filteredPosts = activeCategory === "All"
    ? posts
    : posts.filter(post => post.category === activeCategory);

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950 transition-colors duration-300">
      <SiteHeader />

      <main className="flex-1 w-full mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-20">

        {/* Header Section */}
        <div className="mb-10 max-w-3xl md:mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">
            Blog
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-5">
            Learn AI, Python, and automation
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            Practical guides and tutorials you can follow step by step, written for beginners.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="mb-10 flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-5 dark:border-slate-800">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
              className={`relative whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 border ${
                activeCategory === category
                  ? "text-white border-transparent dark:text-slate-900"
                  : "bg-transparent text-slate-600 border-slate-200 hover:border-slate-400 dark:text-slate-400 dark:border-slate-800 dark:hover:border-slate-600"
              }`}
            >
              {/* The filled pill slides between categories */}
              {activeCategory === category && (
                <motion.span
                  layoutId="blog-category"
                  transition={{ duration: DURATION.ui, ease: EASE }}
                  className="absolute inset-0 rounded-full bg-slate-900 dark:bg-white"
                />
              )}
              <span className="relative">{category}</span>
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
            <article className="group mb-16 grid items-center gap-8 md:mb-20 md:grid-cols-5 md:gap-12">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="relative block aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 md:col-span-3"
              >
                <Image
                  src={featuredPost.coverImage}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.03]"
                  priority
                />
              </Link>
              <div className="md:col-span-2">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">
                  Latest &middot; {featuredPost.category}
                </p>
                <h2 className="mb-4 font-heading text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white md:text-4xl">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="transition-colors duration-150 group-hover:text-accent-600 dark:group-hover:text-accent-400"
                  >
                    {featuredPost.title}
                  </Link>
                </h2>
                <p className="mb-6 line-clamp-3 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                  {featuredPost.excerpt}
                </p>
                <PostMeta post={featuredPost} size="md" />
              </div>
            </article>
          )}

          {/* Grid of Regular Posts */}
          {regularPosts.length > 0 && (
            <>
              <h2 className="mb-8 font-heading text-xl font-bold text-slate-900 dark:text-white">
                More articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
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
