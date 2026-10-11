"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { TocItem } from "@/lib/blog";

/** Highlights the heading currently being read. */
function useActiveHeading(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0] ?? "");
  // Joined so the effect only re-runs when the headings themselves change.
  const idKey = ids.join("|");

  useEffect(() => {
    const headings = idKey
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (headings.length === 0) return;

    // The active heading is the last one that has scrolled past the header.
    let frame = 0;
    const update = () => {
      frame = 0;
      const passed = headings.filter((el) => el.getBoundingClientRect().top <= 120);
      setActiveId((passed[passed.length - 1] ?? headings[0]).id);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [idKey]);

  return activeId;
}

function TocList({ items, activeId }: { items: TocItem[]; activeId?: string }) {
  return (
    <ul className="space-y-2.5 text-sm">
      {items.map((item) => (
        <li key={item.id} className={item.level === 3 ? "pl-4" : undefined}>
          <a
            href={`#${item.id}`}
            aria-current={activeId === item.id ? "location" : undefined}
            className={cn(
              "block leading-snug transition-colors duration-150",
              activeId === item.id
                ? "font-medium text-accent-600 dark:text-accent-400"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Sticky "On this page" list for wide screens. */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const activeId = useActiveHeading(items.map((item) => item.id));
  if (items.length === 0) return null;

  return (
    <nav aria-label="On this page" className="border-l border-slate-200 pl-5 dark:border-slate-800">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
        On this page
      </p>
      <TocList items={items} activeId={activeId} />
    </nav>
  );
}

/** Collapsible version shown above the article on small screens. */
export function MobileTableOfContents({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;

  return (
    <details className="group rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-900 dark:text-white [&::-webkit-details-marker]:hidden">
        On this page
        <span aria-hidden="true" className="text-slate-400 transition-transform duration-200 ease-smooth group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="mt-4">
        <TocList items={items.filter((item) => item.level === 2)} />
      </div>
    </details>
  );
}
