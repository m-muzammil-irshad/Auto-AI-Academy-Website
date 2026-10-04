"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { fetchCourse } from "@/lib/services/courses";
import type { Course } from "@/lib/types";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Badge, courseStatusVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { COURSE_STATUS_LABELS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useEnrollments } from "@/hooks/useEnrollments";
import { Tooltip } from "@/components/ui/Tooltip";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";

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
    try {
      await enroll(id);
      router.push("/student/courses");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to enroll.");
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <Spinner className="h-10 w-10 text-accent-500" />
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
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 z-0">
        <div className="absolute top-[-10rem] left-1/4 h-[30rem] w-[30rem] rounded-full bg-accent-500/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <SiteHeader />
      
      <main className="flex-1 relative z-10 mx-auto w-full max-w-5xl px-4 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-black/20"
        >
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
          
          <div className="p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                {course.title}
              </h1>
              <Badge variant={courseStatusVariant(course.status)} className="w-fit text-sm px-4 py-1.5 shadow-sm">
                {COURSE_STATUS_LABELS[course.status]}
              </Badge>
            </div>
            
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed mb-10 text-lg whitespace-pre-wrap">
              {course.description}
            </div>

            {course.outlineUrl && (
              <div className="mb-10">
                <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Explore More
                </h3>
                <a 
                  href={course.outlineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium transition-colors shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Course Outline
                </a>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-8 mt-8">
              {userIsEnrolled ? (
                <Button size="lg" className="w-full sm:w-auto" onClick={() => router.push("/student/courses")}>
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  {isOngoing && (
                    <Button size="lg" className="w-full sm:w-auto px-8 shadow-lg shadow-accent-500/25 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-accent-500/40 hover:-translate-y-1" onClick={handleEnroll} loading={enrollLoading || enrollmentsLoading}>
                      {user ? "Enroll Now" : "Sign in to Enroll"}
                    </Button>
                  )}
                  {isSoon && (
                    <Tooltip position="left" content="This course opens for enrollment soon — check back later.">
                      <Button size="lg" variant="secondary" disabled className="w-full sm:w-auto px-8 cursor-not-allowed">
                        Coming Soon
                      </Button>
                    </Tooltip>
                  )}
                  {isCompleted && (
                    <Tooltip position="left" content="This course is closed — no new enrollments.">
                      <Button size="lg" variant="secondary" disabled className="w-full sm:w-auto px-8 cursor-not-allowed">
                        Completed
                      </Button>
                    </Tooltip>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
