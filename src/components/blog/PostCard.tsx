import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { isoDate, readingTime } from "@/lib/blog";
import { SHIMMER_BLUR_16_9 } from "@/lib/imageBlur";
import type { BlogPost } from "@/lib/blogData";

/** Author, date and reading time line shared by every post preview. */
export function PostMeta({ post, size = "sm" }: { post: BlogPost; size?: "sm" | "md" }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={post.author} size={size} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{post.author}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          <time dateTime={isoDate(post.date)}>{post.date}</time> &middot; {readingTime(post.content)}
        </p>
      </div>
    </div>
  );
}

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="neu-flat-interactive group flex flex-col rounded-3xl p-3 sm:p-3.5">
      <Link
        href={`/blog/${post.slug}`}
        className="neu-pressed-sm relative mb-3 block aspect-[16/10] w-full overflow-hidden rounded-2xl p-1"
      >
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-200 dark:bg-[#151926]">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            placeholder="blur"
            blurDataURL={SHIMMER_BLUR_16_9}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.03]"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400">
          {post.category}
        </p>
        <h3 className="mb-2 font-heading text-lg font-bold leading-snug text-slate-900 dark:text-white line-clamp-2">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors duration-150 group-hover:text-accent-600 dark:group-hover:text-accent-400"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {post.excerpt}
        </p>
        <div className="pt-3 border-t border-black/5 dark:border-white/5">
          <PostMeta post={post} />
        </div>
      </div>
    </article>
  );
}
