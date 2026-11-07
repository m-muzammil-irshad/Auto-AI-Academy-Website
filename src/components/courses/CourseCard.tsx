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
    <Link href={`/courses/${course.id}`} className="block outline-none focus:ring-2 focus:ring-accent-500 rounded-3xl group">
      <article className="neu-flat-interactive relative flex h-full flex-col overflow-hidden rounded-3xl p-3 sm:p-3.5">
        {/* Recessed thumbnail well */}
        <div className="neu-pressed-sm relative aspect-video w-full overflow-hidden rounded-2xl p-1">
          <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-200 dark:bg-[#151926]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10" />
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                priority={priority}
                placeholder="blur"
                blurDataURL={SHIMMER_BLUR_16_9}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-500/20 to-purple-500/20 dark:from-accent-500/10 dark:to-purple-500/10">
                <span className="font-heading text-lg font-bold text-accent-700/60 dark:text-accent-400/60">
                  Auto AI Academy
                </span>
              </div>
            )}
            <div className="absolute top-3 right-3 z-20">
              <Badge variant={courseStatusVariant(course.status)} className="neu-flat text-xs font-bold rounded-full px-3 py-1 border-none shadow-md backdrop-blur-md">
                {COURSE_STATUS_LABELS[course.status]}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="mb-2.5">
            <h3 className="font-heading text-xl font-bold text-slate-900 transition-colors group-hover:text-accent-600 dark:text-white dark:group-hover:text-accent-400 line-clamp-2">
              {course.title}
            </h3>
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 flex-1">
            {course.description}
          </p>
          <CourseMeta course={course} className="mt-4" />
          <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-sm font-semibold text-accent-600 dark:text-accent-400">
            <span>Explore Course</span>
            <div className="neu-pressed-sm h-8 w-8 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}