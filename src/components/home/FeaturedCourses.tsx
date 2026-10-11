"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCourses } from "@/hooks/useCourses";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";
import { fadeUp, viewportOnce } from "@/lib/motion";

const FEATURED_LIMIT = 3;

export function FeaturedCourses() {
  const { courses, loading, error } = useCourses(FEATURED_LIMIT);

  return (
    <section id="courses" className="relative overflow-hidden bg-transparent transition-colors duration-300 py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-16 flex flex-col items-center justify-between gap-8 md:flex-row md:items-end"
        >
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-3 py-1 text-sm font-semibold text-accent-700 dark:border-accent-500/30 dark:bg-accent-500/10 dark:text-accent-400 shadow-sm">
              <Sparkles className="h-4 w-4" />
              <span>Premium Content. 100% Free.</span>
            </div>
            <h2 className="font-heading text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-purple-600 dark:from-accent-400 dark:to-purple-400">Programs</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Hand-crafted courses designed to take you from absolute beginner to industry-ready expert.
            </p>
          </div>
          <Link href="/courses" className="shrink-0">
            <Button size="lg" className="rounded-full shadow-lg shadow-accent-500/25 hover:shadow-xl hover:shadow-accent-500/30">
              Explore All Courses
            </Button>
          </Link>
        </motion.div>

        {loading ? (
          // Same shape as CourseCard so nothing jumps when the data arrives.
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card-surface p-1">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <div className="p-5">
                  <Skeleton className="mb-3 h-6 w-3/4" />
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
            title="No courses yet — check back soon!"
            description="New programming, AI, and automation courses will appear here as soon as they’re published."
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
