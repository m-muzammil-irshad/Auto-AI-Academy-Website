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
    <article className="neu-flat-interactive relative flex flex-col overflow-hidden rounded-3xl p-3 sm:p-3.5">
      <div className="neu-pressed-sm relative aspect-video w-full overflow-hidden rounded-2xl p-1">
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-200 dark:bg-[#151926]">
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
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-100 to-accent-50 dark:from-accent-900/40 dark:to-accent-800/40">
              <span className="font-heading text-sm font-medium text-accent-700 dark:text-accent-400">
                Auto AI Academy
              </span>
            </div>
          )}
          {course.status === "completed" && (
            <div className="absolute right-2.5 top-2.5 z-10">
              <Badge variant={courseStatusVariant("completed")} className="neu-flat text-xs font-bold rounded-full px-2.5 py-0.5 border-none shadow-sm">
                {COURSE_STATUS_LABELS.completed}
              </Badge>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="mb-2 font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          {course.title}
        </h3>
        <p className="mb-5 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {course.description}
        </p>
        {progress && progress.total > 0 && (
          <div className="mb-5 neu-pressed-sm p-3 rounded-2xl">
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Assignments</span>
              <span className="tabular-nums font-bold text-slate-700 dark:text-slate-300">
                {progress.submitted} / {progress.total}
              </span>
            </div>
            <ProgressBar
              value={progress.submitted / progress.total}
              label={`${course.title} assignments submitted`}
            />
          </div>
        )}
        <div className="mt-auto pt-3 border-t border-black/5 dark:border-white/5 flex flex-col gap-2">
          <Link href={`/student/courses/${course.id}/learn`} className="block">
            <Button className="w-full neu-btn-primary rounded-full font-bold flex items-center justify-center gap-2">
              <PlayCircle className="h-4 w-4" />
              <span>Continue Learning</span>
            </Button>
          </Link>
          <a
            href={course.youtubeChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="secondary" size="sm" className="w-full neu-btn rounded-full text-xs font-medium text-slate-500 hover:text-red-500">
              Watch on YouTube
            </Button>
          </a>
        </div>
      </div>
    </article>
  );
}