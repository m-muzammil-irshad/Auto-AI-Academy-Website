import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PostCard } from "@/components/blog/PostCard";
import { MobileTableOfContents, TableOfContents } from "@/components/blog/TableOfContents";
import { CodeCopyHandler, ReadingProgress, ShareButtons } from "@/components/blog/ArticleExtras";
import { isoDate, prepareArticle, readingTime } from "@/lib/blog";
import { getPublishedPost, getPublishedPosts } from "@/lib/blogPublic";
import { SHIMMER_BLUR_16_9 } from "@/lib/imageBlur";
import { SITE_NAME } from "@/lib/constants";
import { ORGANIZATION_JSON_LD, absoluteUrl, seoAlternates } from "@/lib/seo";

// Posts come from the database; serve a cached page for up to a minute.
// Keep in sync with BLOG_REVALIDATE_SECONDS in lib/blogPublic.ts.
export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedPost(params.slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: seoAlternates(`/blog/${post.slug}`),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: isoDate(post.date),
      authors: [post.author],
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPublishedPost(params.slug);

  if (!post) {
    notFound();
  }

  const { html, toc } = prepareArticle(post.content);
  const url = absoluteUrl(`/blog/${post.slug}`);

  // Same-category posts first, then the rest, newest order preserved.
  const others = (await getPublishedPosts()).filter((p) => p.slug !== post.slug);
  const relatedPosts = [
    ...others.filter((p) => p.category === post.category),
    ...others.filter((p) => p.category !== post.category),
  ].slice(0, 3);

  // Schema for the article and its breadcrumb trail
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "image": post.coverImage,
        "author": {
          "@type": "Person",
          "name": post.author
        },
        "publisher": ORGANIZATION_JSON_LD,
        "datePublished": isoDate(post.date),
        "mainEntityOfPage": url,
        "articleSection": post.category,
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": absoluteUrl("/") },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": absoluteUrl("/blog") },
          { "@type": "ListItem", "position": 3, "name": post.title, "item": url },
        ],
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#e8ecf4] dark:bg-[#10131d] transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <ReadingProgress />
      <CodeCopyHandler />

      <main className="flex-1 w-full pb-20 sm:pb-28">
        {/* Title block */}
        <header className="mx-auto w-full max-w-3xl px-4 pt-10 sm:px-6 md:pt-14">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/blog" className="transition-colors duration-150 hover:text-slate-900 dark:hover:text-white">
              Blog
            </Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span className="font-semibold text-accent-600 dark:text-accent-400">{post.category}</span>
          </nav>

          <h1 className="font-heading text-[2rem] font-extrabold leading-[1.15] tracking-tight text-slate-900 dark:text-white sm:text-[2.5rem] md:text-5xl md:leading-[1.1]">
            {post.title}
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-slate-600 dark:text-slate-400 sm:text-xl">
            {post.excerpt}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-black/5 dark:border-white/5 py-4">
            <div className="flex items-center gap-3">
              <Avatar name={post.author} size="lg" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{post.author}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  <time dateTime={isoDate(post.date)}>{post.date}</time> &middot; {readingTime(post.content)}
                </p>
              </div>
            </div>
            <ShareButtons url={url} title={post.title} />
          </div>
        </header>

        {/* Cover image: wider than the text column */}
        <div className="mx-auto mt-10 w-full max-w-5xl px-4 sm:px-6">
          <div className="neu-pressed-sm relative aspect-video w-full overflow-hidden rounded-3xl p-1.5 sm:p-2">
            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-200 dark:bg-[#151926]">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                placeholder="blur"
                blurDataURL={SHIMMER_BLUR_16_9}
                sizes="(max-width: 1024px) 100vw, 976px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Article with a sticky table of contents alongside on wide screens */}
        <div className="mx-auto mt-12 w-full max-w-3xl px-4 sm:px-6 xl:grid xl:max-w-6xl xl:grid-cols-[minmax(0,45rem)_1fr] xl:justify-center xl:gap-16">
          <div className="min-w-0">
            <div className="mb-10 xl:hidden">
              <MobileTableOfContents items={toc} />
            </div>

            <article className="article" dangerouslySetInnerHTML={{ __html: html }} />

            {/* Call to action */}
            <div className="mt-14 rounded-3xl neu-flat-lg bg-gradient-to-br from-accent-600 to-purple-600 p-8 text-white sm:p-10">
              <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
                Put this into practice
              </h2>
              <p className="mt-3 max-w-xl text-accent-100">
                {SITE_NAME} courses are completely free, with assignments, feedback, and a certificate when you finish.
              </p>
              <Link href="/courses" className="mt-6 inline-block">
                <Button size="lg" variant="secondary" className="rounded-full border-none bg-white px-8 font-bold text-accent-700 shadow-lg hover:bg-slate-100 dark:bg-white dark:text-accent-700 dark:hover:bg-slate-100 transition-transform hover:scale-105 active:scale-95">
                  Browse free courses
                </Button>
              </Link>
            </div>

            {/* Author and share */}
            <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-black/5 dark:border-white/5 pt-8">
              <div className="flex items-center gap-4">
                <Avatar name={post.author} size="lg" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Written by
                  </p>
                  <p className="font-heading text-lg font-semibold text-slate-900 dark:text-white">{post.author}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 dark:text-slate-400">Share this article</span>
                <ShareButtons url={url} title={post.title} />
              </div>
            </div>
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-28">
              <TableOfContents items={toc} />
            </div>
          </aside>
        </div>

        {/* Keep reading */}
        {relatedPosts.length > 0 && (
          <section className="mx-auto mt-20 w-full max-w-6xl border-t border-black/5 dark:border-white/5 px-4 pt-14 sm:px-6">
            <div className="mb-10 flex items-end justify-between gap-4">
              <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                Keep reading
              </h2>
              <Link
                href="/blog"
                className="text-sm font-medium text-accent-600 transition-colors duration-150 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
              >
                All articles &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => (
                <PostCard key={related.id} post={related} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
