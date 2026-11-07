"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Award, CheckCircle2, ClipboardCheck, FileText, MessageCircle, PlayCircle } from "lucide-react";
import { CourseMeta } from "@/components/courses/CourseMeta";
import { fetchCourse } from "@/lib/services/courses";
import type { Course } from "@/lib/types";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Badge, courseStatusVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { COURSE_STATUS_LABELS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useEnrollments } from "@/hooks/useEnrollments";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SHIMMER_BLUR_16_9 } from "@/lib/imageBlur";
import { fadeUp, stagger } from "@/lib/motion";

// What every course on the platform comes with.
const INCLUDED = [
  { icon: PlayCircle, text: "Video lessons on our official YouTube channel" },
  { icon: ClipboardCheck, text: "Assignments graded on correctness, creativity, and timeliness" },
  { icon: Award, text: "Certificate after submitting 80% of assignments" },
  { icon: MessageCircle, text: "24/7 AI assistant and WhatsApp support" },
];

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { user } = useAuth();
  const { enroll, isEnrolled, loading: enrollmentsLoading } = useEnrollments(user?.uid);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchCourse(id)
      .then((data) => {
        if (data) {
          setCourse(data);
        } else {
          setError("Course not found.");
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Error loading course.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setEnrollLoading(true);
    setEnrollError("");
    try {
      await enroll(id);
      router.push(`/student/courses/${id}/learn`);
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : "Failed to enroll.");
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#090c15] text-slate-900 dark:text-slate-100 transition-colors duration-150">
        <SiteHeader />
        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-12 sm:py-16">
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="p-4 sm:p-6">
              <Skeleton className="mb-6 h-8 w-2/3" />
              <Skeleton className="mb-3 h-4 w-full" />
              <Skeleton className="mb-3 h-4 w-full" />
              <Skeleton className="mb-8 h-4 w-3/5" />
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#090c15] text-slate-900 dark:text-slate-100 transition-colors duration-150">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center p-4">
          <EmptyState title="Course Not Found" description={error || "The course you are looking for does not exist."} />
        </main>
        <SiteFooter />
      </div>
    );
  }

  const isOngoing = course.status === "ongoing";
  const isSoon = course.status === "soon";
  const isCompleted = course.status === "completed";
  const userIsEnrolled = user && isEnrolled(id);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#090c15] text-slate-900 dark:text-slate-100 transition-colors duration-150">
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-10 sm:py-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid items-start gap-8 lg:grid-cols-3"
        >
          {/* Course content */}
          <motion.article variants={fadeUp} className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 sm:p-6 shadow-sm lg:col-span-2">
            {course.thumbnail ? (
              <div className="w-full relative rounded-lg overflow-hidden flex justify-center bg-slate-100 dark:bg-slate-950">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  width={1280}
                  height={720}
                  placeholder="blur"
                  blurDataURL={SHIMMER_BLUR_16_9}
                  sizes="(max-width: 1024px) 100vw, 850px"
                  className="w-full h-auto object-contain max-h-[500px]"
                  priority={true}
                />
              </div>
            ) : (
              <div className="w-full relative aspect-video flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900">
                <span className="font-heading text-xl font-medium text-slate-500 dark:text-slate-400">
                  Auto AI Academy
                </span>
              </div>
            )}

            <div className="pt-6 sm:pt-8">
              <h1 className="mb-4 font-heading text-2xl sm:text-3xl font-medium text-slate-900 dark:text-white">
                {course.title}
              </h1>

              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                {course.description}
              </div>

              {course.outcomes.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-heading text-lg font-medium text-slate-900 dark:text-white mb-3">
                    What you&apos;ll learn
                  </h2>
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {course.outcomes.map((outcome) => (
                      <li key={outcome} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.outlineUrl && (
                <div className="mt-8">
                  <h2 className="font-heading text-lg font-medium text-slate-900 dark:text-white mb-3">
                    Course outline
                  </h2>
                  <a
                    href={course.outlineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                    View document outline
                  </a>
                </div>
              )}
            </div>
          </motion.article>

          {/* Enrollment sidebar card */}
          <motion.aside variants={fadeUp} className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-4">
              <p className="font-heading text-2xl font-medium text-slate-900 dark:text-white">Free</p>
              <Badge variant={courseStatusVariant(course.status)}>
                {COURSE_STATUS_LABELS[course.status]}
              </Badge>
            </div>

            <CourseMeta course={course} className="mt-3 text-xs" />

            <ul className="mt-5 space-y-2.5 border-t border-slate-100 dark:border-slate-800/80 pt-5">
              {INCLUDED.map((item) => (
                <li key={item.text} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                  {item.text}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {userIsEnrolled ? (
                <div className="flex flex-col gap-2.5">
                  <Button size="lg" className="w-full neu-btn-primary rounded-full font-bold flex items-center justify-center gap-2" onClick={() => router.push(`/student/courses/${id}/learn`)}>
                    <PlayCircle className="h-5 w-5" />
                    <span>Go to Classroom</span>
                  </Button>
                  <Button size="sm" variant="secondary" className="w-full neu-btn rounded-full font-medium text-xs text-slate-600 dark:text-slate-300" onClick={() => router.push("/student/courses")}>
                    View in Dashboard
                  </Button>
                </div>
              ) : (
                <>
                  {isOngoing && (
                    <Button size="lg" className="w-full neu-btn-primary rounded-full font-bold" onClick={handleEnroll} loading={enrollLoading || enrollmentsLoading}>
                      {user ? "Enroll Now" : "Sign in to Enroll"}
                    </Button>
                  )}
                  {isSoon && (
                    <>
                      <Button size="lg" variant="secondary" disabled className="w-full neu-btn rounded-full font-semibold">
                        Coming Soon
                      </Button>
                      <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                        This course opens for enrollment soon — check back later.
                      </p>
                    </>
                  )}
                  {isCompleted && (
                    <>
                      <Button size="lg" variant="secondary" disabled className="w-full neu-btn rounded-full font-semibold">
                        Completed
                      </Button>
                      <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                        This course is closed — no new enrollments.
                      </p>
                    </>
                  )}
                </>
              )}
            </div>

            {enrollError && (
              <p
                role="alert"
                className="mt-4 animate-shake rounded-2xl neu-pressed-sm p-4 text-sm font-medium text-red-600 dark:text-red-400"
              >
                {enrollError}
              </p>
            )}
          </motion.aside>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}
