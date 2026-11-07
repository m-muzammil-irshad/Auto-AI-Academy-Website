"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PostCard, PostMeta } from "@/components/blog/PostCard";
import { SHIMMER_BLUR_16_9 } from "@/lib/imageBlur";
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
    <div className="flex min-h-screen flex-col bg-[#e8ecf4] dark:bg-[#10131d] transition-colors duration-300">
      <SiteHeader />

      <main className="flex-1 w-full mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-20">

        {/* Header Section */}
        <div className="mb-10 max-w-3xl md:mb-12">
          <div className="mb-3 neu-pressed-sm inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400">
            <span>Official Blog</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-5">
            Learn AI, Python, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-purple-600 dark:from-accent-400 dark:to-purple-400">automation</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            Practical guides and tutorials you can follow step by step, written for beginners.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="mb-10 flex items-center gap-2 overflow-x-auto p-1.5 rounded-full neu-pressed-sm w-fit max-w-full">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
              className={`relative whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeCategory === category
                  ? "neu-btn text-accent-600 dark:text-accent-400 font-bold shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
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
            <article className="neu-flat-interactive rounded-3xl p-4 sm:p-6 mb-16 grid items-center gap-8 md:mb-20 md:grid-cols-5 md:gap-10 group">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="neu-pressed-sm relative block aspect-video w-full overflow-hidden rounded-2xl p-1 md:col-span-3"
              >
                <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-200 dark:bg-[#151926]">
                  <Image
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    fill
                    placeholder="blur"
                    blurDataURL={SHIMMER_BLUR_16_9}
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.03]"
                    priority
                  />
                </div>
              </Link>
              <div className="md:col-span-2 p-2">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400">
                  Latest &middot; {featuredPost.category}
                </p>
                <h2 className="mb-4 font-heading text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white md:text-3xl">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="transition-colors duration-150 group-hover:text-accent-600 dark:group-hover:text-accent-400"
                  >
                    {featuredPost.title}
                  </Link>
                </h2>
                <p className="mb-6 line-clamp-3 text-base leading-relaxed text-slate-600 dark:text-slate-400">
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
