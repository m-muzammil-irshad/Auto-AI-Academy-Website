"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCourses } from "@/hooks/useCourses";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { fadeUp, viewportOnce } from "@/lib/motion";
import type { Course } from "@/lib/types";

const FEATURED_LIMIT = 3;

export function FeaturedCourses({ initialCourses }: { initialCourses?: Course[] } = {}) {
  const { courses, loading, error } = useCourses(FEATURED_LIMIT, initialCourses);

  return (
    <section id="courses" className="relative bg-transparent transition-colors duration-200 py-20 sm:py-24">
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
        >
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-1 text-xs text-slate-600 dark:text-slate-400">
              <span>Curriculum</span>
            </div>
            <h2 className="font-heading text-3xl font-medium tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Featured courses
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              Structured courses taught in Urdu and Hindi, covering Python, Artificial Intelligence, and modern workflow automation.
            </p>
          </div>
          <Link href="/courses" className="shrink-0">
            <Button size="lg" variant="secondary" className="rounded-lg px-5 py-2.5 text-sm font-medium">
              View all courses
            </Button>
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-3">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <div className="p-4">
                  <Skeleton className="mb-3 h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState title="Could not load courses" description={error} />
        ) : courses.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="New programming, AI, and automation courses will appear here as soon as they are published."
          />
        ) : (
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce}>
            <CourseGrid courses={courses} />
          </motion.div>
        )}
      </div>
    </section>
  );
}
