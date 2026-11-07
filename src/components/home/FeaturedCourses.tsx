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
import type { Course } from "@/lib/types";

const FEATURED_LIMIT = 3;

export function FeaturedCourses({ initialCourses }: { initialCourses?: Course[] } = {}) {
  const { courses, loading, error } = useCourses(FEATURED_LIMIT, initialCourses);

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
            <div className="mb-4 neu-pressed-sm inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400">
              <Sparkles className="h-4 w-4" />
              <span>Premium Curriculum · 100% Free</span>
            </div>
            <h2 className="font-heading text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-purple-600 dark:from-accent-400 dark:to-purple-400">Programs</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Free Python and n8n automation courses in Urdu/Hindi, designed to take you from absolute beginner to job-ready.
            </p>
          </div>
          <Link href="/courses" className="shrink-0">
            <Button size="lg" className="neu-btn-primary rounded-full px-8 py-3.5 font-bold">
              Explore All Courses
            </Button>
          </Link>
        </motion.div>

        {loading ? (
          // Same shape as CourseCard so nothing jumps when the data arrives.
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="neu-flat rounded-3xl p-3">
                <Skeleton className="aspect-video w-full rounded-2xl" />
                <div className="p-4">
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
