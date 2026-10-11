import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { isoDate, readingTime } from "@/lib/blog";
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
    <article className="group flex flex-col">
      <Link
        href={`/blog/${post.slug}`}
        className="relative mb-5 block aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900"
      >
        <Image
          src={post.coverImage}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">
          {post.category}
        </p>
        <h3 className="mb-2 font-heading text-xl font-bold leading-snug text-slate-900 dark:text-white">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors duration-150 group-hover:text-accent-600 dark:group-hover:text-accent-400"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mb-5 line-clamp-2 flex-1 text-[0.9375rem] leading-relaxed text-slate-600 dark:text-slate-400">
          {post.excerpt}
        </p>
        <PostMeta post={post} />
      </div>
    </article>
  );
}
