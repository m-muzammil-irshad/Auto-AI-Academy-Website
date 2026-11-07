"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge, courseStatusVariant } from "@/components/ui/Badge";
import { CourseMeta } from "@/components/courses/CourseMeta";
import { COURSE_STATUS_LABELS } from "@/lib/constants";
import { SHIMMER_BLUR_16_9 } from "@/lib/imageBlur";
import type { Course } from "@/lib/types";
import { ArrowRight } from "lucide-react";

export interface CourseCardProps {
  course: Course;
  priority?: boolean;
}

export function CourseCard({ course, priority = false }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl group h-full">
      <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-3 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-700">
        {/* Thumbnail well */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-950">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              priority={priority}
              placeholder="blur"
              blurDataURL={SHIMMER_BLUR_16_9}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
              className="object-cover transition-opacity duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-900">
              <span className="font-heading text-sm font-medium text-slate-500 dark:text-slate-400">
                Auto AI Academy
              </span>
            </div>
          )}
          <div className="absolute top-2.5 right-2.5 z-10">
            <Badge variant={courseStatusVariant(course.status)} className="text-xs font-normal rounded-md px-2 py-0.5 shadow-sm">
              {COURSE_STATUS_LABELS[course.status]}
            </Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <h3 className="font-heading text-base font-medium text-slate-900 dark:text-white line-clamp-1 mb-2">
            {course.title}
          </h3>
          <p className="line-clamp-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
            {course.description}
          </p>
          <CourseMeta course={course} className="mt-4" />
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-indigo-600 dark:text-indigo-400">
            <span>View curriculum</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </article>
    </Link>
  );
}
