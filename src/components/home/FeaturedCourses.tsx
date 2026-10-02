"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCourses } from "@/hooks/useCourses";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";

const FEATURED_LIMIT = 3;

export function FeaturedCourses() {
  const { courses, loading, error } = useCourses(FEATURED_LIMIT);

  return (
    <section id="courses" className="relative overflow-hidden bg-transparent transition-colors duration-300 py-24 sm:py-32">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 h-[50rem] w-[50rem] rounded-full bg-gradient-to-bl from-accent-500/10 to-purple-500/10 blur-[120px] dark:from-accent-500/10 dark:to-purple-500/10" />
        <div className="absolute -left-40 bottom-0 h-[40rem] w-[40rem] rounded-full bg-gradient-to-tr from-blue-500/10 to-transparent blur-[120px]" />
      </div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="mb-16 flex flex-col items-center justify-between gap-8 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl text-center md:text-left"
          >
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
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="shrink-0"
          >
            <Link href="/courses">
              <Button size="lg" className="rounded-full shadow-lg shadow-accent-500/25 transition-transform hover:scale-105 hover:shadow-xl hover:shadow-accent-500/40">
                Explore All Courses
              </Button>
            </Link>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-3xl border border-slate-200/50 bg-white/50 p-2 shadow-sm backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/50"
              >
                <div className="aspect-video w-full rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
                <div className="p-6">
                  <div className="mb-4 h-8 w-3/4 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
                  <div className="h-4 w-full rounded bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
                  <div className="mt-3 h-4 w-5/6 rounded bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
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
          <CourseGrid courses={courses} />
        )}
      </div>
    </section>
  );
}
