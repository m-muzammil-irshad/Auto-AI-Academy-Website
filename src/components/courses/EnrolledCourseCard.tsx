import Link from "next/link";
import Image from "next/image";
import { PlayCircle } from "lucide-react";
import { Badge, courseStatusVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/Progress";
import { COURSE_STATUS_LABELS } from "@/lib/constants";
import { SHIMMER_BLUR_16_9 } from "@/lib/imageBlur";
import type { Course } from "@/lib/types";

export interface EnrolledCourseCardProps {
  course: Course;
  /** Assignments submitted out of the course total; hidden when the course has none. */
  progress?: { submitted: number; total: number };
}

export function EnrolledCourseCard({ course, progress }: EnrolledCourseCardProps) {
  return (
    <article className="relative flex flex-col overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-3 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-700">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-950">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            placeholder="blur"
            blurDataURL={SHIMMER_BLUR_16_9}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-900">
            <span className="font-heading text-sm font-medium text-slate-500 dark:text-slate-400">
              Auto AI Academy
            </span>
          </div>
        )}
        {course.status === "completed" && (
          <div className="absolute right-2.5 top-2.5 z-10">
            <Badge variant={courseStatusVariant("completed")}>
              {COURSE_STATUS_LABELS.completed}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="mb-1.5 font-heading text-base font-medium text-slate-900 dark:text-white line-clamp-1">
          {course.title}
        </h3>
        <p className="mb-4 line-clamp-2 flex-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {course.description}
        </p>

        {progress && progress.total > 0 && (
          <div className="mb-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2.5">
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Assignments</span>
              <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                {progress.submitted} / {progress.total}
              </span>
            </div>
            <ProgressBar
              value={progress.submitted / progress.total}
              label={`${course.title} assignments submitted`}
            />
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
          <Link href={`/student/courses/${course.id}/learn`} className="block">
            <Button className="w-full rounded-lg font-medium text-xs flex items-center justify-center gap-2">
              <PlayCircle className="h-3.5 w-3.5" />
              <span>Continue learning</span>
            </Button>
          </Link>
          {course.youtubeChannelUrl && (
            <a
              href={course.youtubeChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white">
                Watch on YouTube
              </Button>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
