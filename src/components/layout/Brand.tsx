import { useId } from "react";
import Link from "next/link";
import { brandMarkSvg } from "@/lib/brandIcon";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

/**
 * Logo mark plus site name, linking home.
 * The mark is a navy disc with a bright blue ring: the disc stands out on the
 * light theme and the ring keeps it separated from the dark one.
 */
export function Brand({ href = "/", className }: { href?: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 font-heading text-lg font-semibold text-slate-900 dark:text-white",
        className
      )}
    >
      <span className="shrink-0 rounded-full shadow-sm shadow-blue-500/30 dark:shadow-blue-400/40">
        {brandMarkSvg(32, id)}
      </span>
      {SITE_NAME}
    </Link>
  );
}
