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
      router.push("/student/courses");
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : "Failed to enroll.");
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <SiteHeader />
        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-12 sm:py-20">
          {/* Same outline as the loaded course so the page doesn't jump */}
          <div className="card-surface overflow-hidden rounded-3xl">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="p-8 sm:p-12">
              <Skeleton className="mb-6 h-10 w-2/3" />
              <Skeleton className="mb-3 h-5 w-full" />
              <Skeleton className="mb-3 h-5 w-full" />
              <Skeleton className="mb-10 h-5 w-3/5" />
              <Skeleton className="h-12 w-40 rounded-xl" />
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
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
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 relative overflow-x-clip transition-colors duration-300">
      <div className="pointer-events-none absolute left-1/4 top-[-10rem] z-0 h-[30rem] w-[30rem] rounded-full bg-accent-500/10 blur-[100px]" />

      <SiteHeader />

      <main className="flex-1 relative z-10 mx-auto w-full max-w-6xl px-4 py-12 sm:py-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid items-start gap-8 lg:grid-cols-3"
        >
          {/* Course content */}
          <motion.article variants={fadeUp} className="card-surface overflow-hidden rounded-3xl lg:col-span-2">
            {course.thumbnail ? (
              <div className="w-full relative bg-slate-100 dark:bg-slate-900 flex justify-center">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  width={1280}
                  height={720}
                  className="w-full h-auto object-contain max-h-[600px]"
                  priority={true}
                />
              </div>
            ) : (
              <div className="w-full relative aspect-video flex items-center justify-center bg-gradient-to-br from-accent-500/20 to-purple-500/20">
                <span className="font-heading text-3xl font-bold text-accent-700/50 dark:text-accent-400/50">
                  Auto AI Academy
                </span>
              </div>
            )}

            <div className="p-8 sm:p-10">
              <h1 className="mb-6 font-heading text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                {course.title}
              </h1>

              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                {course.description}
              </div>

              {course.outcomes.length > 0 && (
                <div className="mt-10">
                  <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white mb-4">
                    What you&apos;ll learn
                  </h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {course.outcomes.map((outcome) => (
                      <li key={outcome} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.outlineUrl && (
                <div className="mt-10">
                  <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Explore More
                  </h2>
                  <a
                    href={course.outlineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium transition-colors duration-150 shadow-sm"
                  >
                    <FileText className="h-5 w-5 text-accent-500" aria-hidden="true" />
                    View Course Outline
                  </a>
                </div>
              )}
            </div>
          </motion.article>

          {/* Enrollment card stays in view while the description scrolls */}
          <motion.aside variants={fadeUp} className="card-surface rounded-3xl p-6 sm:p-8 lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-4">
              <p className="font-heading text-3xl font-bold text-slate-900 dark:text-white">Free</p>
              <Badge variant={courseStatusVariant(course.status)} className="w-fit px-3 py-1 text-sm">
                {COURSE_STATUS_LABELS[course.status]}
              </Badge>
            </div>

            <CourseMeta course={course} className="mt-4 text-sm" />

            <ul className="mt-6 space-y-3 border-t border-slate-200/60 pt-6 dark:border-slate-800/60">
              {INCLUDED.map((item) => (
                <li key={item.text} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" aria-hidden="true" />
                  {item.text}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {userIsEnrolled ? (
                <Button size="lg" className="w-full" onClick={() => router.push("/student/courses")}>
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  {isOngoing && (
                    <Button size="lg" className="w-full shadow-lg shadow-accent-500/25 hover:shadow-xl hover:shadow-accent-500/30" onClick={handleEnroll} loading={enrollLoading || enrollmentsLoading}>
                      {user ? "Enroll Now" : "Sign in to Enroll"}
                    </Button>
                  )}
                  {isSoon && (
                    <>
                      <Button size="lg" variant="secondary" disabled className="w-full">
                        Coming Soon
                      </Button>
                      <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                        This course opens for enrollment soon — check back later.
                      </p>
                    </>
                  )}
                  {isCompleted && (
                    <>
                      <Button size="lg" variant="secondary" disabled className="w-full">
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
                className="mt-4 animate-shake rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
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
