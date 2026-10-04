"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge, courseStatusVariant } from "@/components/ui/Badge";
import { COURSE_STATUS_LABELS } from "@/lib/constants";
import type { Course } from "@/lib/types";

export interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`} className="block outline-none focus:ring-2 focus:ring-accent-500 rounded-2xl group">
      <motion.article
        whileHover={{ y: -5 }}
        className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/50 bg-white/50 p-1 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-accent-500/50 hover:shadow-xl hover:shadow-accent-500/10 dark:border-slate-800/50 dark:bg-slate-900/50 dark:hover:border-accent-400/50 dark:hover:shadow-accent-400/10 h-full"
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10" />
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-500/20 to-purple-500/20 dark:from-accent-500/10 dark:to-purple-500/10">
              <span className="font-heading text-lg font-bold text-accent-700/50 dark:text-accent-400/50">
                Auto AI Academy
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3 z-20">
            <Badge variant={courseStatusVariant(course.status)} className="shadow-lg backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-none">
              {COURSE_STATUS_LABELS[course.status]}
            </Badge>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3">
            <h3 className="font-heading text-lg font-bold text-slate-900 transition-colors group-hover:text-accent-600 dark:text-white dark:group-hover:text-accent-400">
              {course.title}
            </h3>
          </div>
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 flex-1">
            {course.description}
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-sm font-medium text-accent-600 dark:text-accent-400">
            <span className="group-hover:underline transition-all">Explore Course</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}