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
import type { CourseStatus } from "@/lib/types";

type StatusFilter = "all" | CourseStatus;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ongoing", label: COURSE_STATUS_LABELS.ongoing },
  { value: "soon", label: COURSE_STATUS_LABELS.soon },
  { value: "completed", label: COURSE_STATUS_LABELS.completed },
];

export default function PublicCoursesPage() {
  const { courses, loading, error } = useCourses();
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
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-x-clip">
      {/* Background glow */}
      <div className="pointer-events-none absolute right-1/4 top-[-10rem] z-0 h-[30rem] w-[30rem] rounded-full bg-accent-500/10 blur-[100px]" />

      <SiteHeader />

      <main className="flex-1 relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-10 max-w-2xl">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              All <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-purple-600 dark:from-accent-400 dark:to-purple-400">Courses</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Browse our complete catalog of programming, AI, and automation courses. Sign up to enroll and start submitting assignments.
            </p>
          </motion.div>

          {/* Search and status filter */}
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses"
                aria-label="Search courses"
                className="block w-full rounded-xl border border-slate-200/60 bg-white/70 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 backdrop-blur-sm transition-colors duration-150 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {FILTERS.map((filter) => {
                const active = status === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatus(filter.value)}
                    aria-pressed={active}
                    className={`relative whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
                      active
                        ? "border-transparent text-white dark:text-slate-900"
                        : "border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-600"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="course-status-filter"
                        transition={{ duration: DURATION.ui, ease: EASE }}
                        className="absolute inset-0 rounded-full bg-slate-900 dark:bg-white"
                      />
                    )}
                    <span className="relative">{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="card-surface p-1">
                  <div className="skeleton aspect-video w-full rounded-xl" />
                  <div className="p-5">
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
