import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { isoDate, readingTime } from "@/lib/blog";
import { SHIMMER_BLUR_16_9 } from "@/lib/imageBlur";
import type { BlogPost } from "@/lib/blogData";

export function PostMeta({ post, size = "sm" }: { post: BlogPost; size?: "sm" | "md" }) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar name={post.author} size={size} className="rounded-md" />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-900 dark:text-white">{post.author}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          <time dateTime={isoDate(post.date)}>{post.date}</time> &middot; {readingTime(post.content)}
        </p>
      </div>
    </div>
  );
}

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex flex-col rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-3 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-700">
      <Link
        href={`/blog/${post.slug}`}
        className="relative mb-3 block aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-950"
      >
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          placeholder="blur"
          blurDataURL={SHIMMER_BLUR_16_9}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 380px"
          className="object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col p-2.5">
        <p className="mb-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
          {post.category}
        </p>
        <h3 className="mb-2 font-heading text-base font-medium leading-snug text-slate-900 dark:text-white line-clamp-2">
          <Link
            href={`/blog/${post.slug}`}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mb-4 line-clamp-2 flex-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {post.excerpt}
        </p>
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <PostMeta post={post} />
        </div>
      </div>
    </article>
  );
}
