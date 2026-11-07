"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useCourses } from "@/hooks/useCourses";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { COURSE_STATUS_LABELS } from "@/lib/constants";
import { DURATION, EASE, fadeUp } from "@/lib/motion";
import type { Course, CourseStatus } from "@/lib/types";

type StatusFilter = "all" | CourseStatus;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ongoing", label: COURSE_STATUS_LABELS.ongoing },
  { value: "soon", label: COURSE_STATUS_LABELS.soon },
  { value: "completed", label: COURSE_STATUS_LABELS.completed },
];

export function CoursesCatalog({ initialCourses }: { initialCourses?: Course[] } = {}) {
  const { courses, loading, error } = useCourses(undefined, initialCourses);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const visibleCourses = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return courses.filter(
      (c) =>
        (status === "all" || c.status === status) &&
        (!needle ||
          c.title.toLowerCase().includes(needle) ||
          c.description.toLowerCase().includes(needle))
    );
  }, [courses, query, status]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#090c15] text-slate-900 dark:text-slate-100 transition-colors duration-150">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-8 max-w-2xl">
            <h1 className="font-heading text-3xl font-medium tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              All courses
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Browse our complete catalog of programming, AI, and automation courses. Enroll to access lesson video players and assignments.
            </p>
          </motion.div>

          {/* Search and status filter */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses"
                aria-label="Search courses"
                className="block w-full rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-1.5 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
              {FILTERS.map((filter) => {
                const active = status === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatus(filter.value)}
                    aria-pressed={active}
                    className={`whitespace-nowrap rounded-md px-3 py-1 text-xs transition-colors ${
                      active
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="neu-flat rounded-3xl p-3.5">
                  <div className="skeleton aspect-video w-full rounded-2xl" />
                  <div className="p-4">
                    <div className="skeleton mb-3 h-6 w-3/4" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton mt-2 h-4 w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <EmptyState title="Could not load courses" description={error} />
          ) : courses.length === 0 ? (
            <EmptyState
              title="No courses yet — check back soon!"
              description="New programming, AI, and automation courses will be listed here as soon as they go live."
            />
          ) : visibleCourses.length === 0 ? (
            <EmptyState
              title="No courses match your search"
              description="Try a different keyword or switch the status filter back to All."
            />
          ) : (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.ui, ease: EASE }}
            >
              <CourseGrid courses={visibleCourses} />
            </motion.div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
