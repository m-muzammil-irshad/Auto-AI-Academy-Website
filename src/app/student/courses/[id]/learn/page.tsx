"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  ListVideo,
  Play,
  Share2,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEnrollments } from "@/hooks/useEnrollments";
import { fetchCourse } from "@/lib/services/courses";
import {
  fetchCourseProgress,
  saveCourseProgress,
  toggleLessonCompleted,
} from "@/lib/services/courseProgress";
import { CoursePlayer } from "@/components/courses/CoursePlayer";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/Progress";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Course, Lesson, UserCourseProgress } from "@/lib/types";

export default function CourseLearnPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const { user, authLoading } = useAuth();
  const { isEnrolled, loading: enrollmentsLoading } = useEnrollments(user?.uid);

  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<UserCourseProgress | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string>("");
  const [initialSeconds, setInitialSeconds] = useState<number>(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCurriculumMobile, setShowCurriculumMobile] = useState(false);

  // Debounce ref for timestamp writes
  const lastSavedTimeRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Course and Progress
  useEffect(() => {
    if (!courseId) return;

    let mounted = true;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const fetchedCourse = await fetchCourse(courseId);
        if (!fetchedCourse) {
          if (mounted) setError("Course not found.");
          return;
        }

        if (mounted) setCourse(fetchedCourse);

        // Fetch User Progress if logged in
        if (user?.uid) {
          try {
            const userProgress = await fetchCourseProgress(user.uid, courseId);
            if (mounted && userProgress) {
              setProgress(userProgress);
              setCompletedIds(userProgress.completedLessonIds || []);
              if (userProgress.currentLessonId) {
                setActiveLessonId(userProgress.currentLessonId);
                setInitialSeconds(userProgress.lastTimestampSeconds || 0);
              }
            }
          } catch (progressErr) {
            console.warn("Could not load progress:", progressErr);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load course.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadData();

    return () => {
      mounted = false;
    };
  }, [courseId, user?.uid]);

  // Normalized Lessons list (ensures rich multi-lesson curriculum even if course has only outcomes or youtubeChannelUrl)
  const lessons: Lesson[] = useMemo(() => {
    if (!course) return [];
    if (course.lessons && course.lessons.length > 0) {
      return course.lessons;
    }

    // If course has outcomes, generate structured learning modules so navigation and progress tracking work out of the box
    if (course.outcomes && course.outcomes.length > 0) {
      return [
        {
          id: "lesson-intro",
          title: `${course.title} - Foundation & Overview`,
          youtubeUrl: course.youtubeChannelUrl,
          duration: course.duration ? `${course.duration} Module 1` : "Course Intro",
          description: course.description || "Foundational concepts, platform architecture, and roadmap.",
          order: 1,
        },
        ...course.outcomes.map((outcome, idx) => ({
          id: `lesson-outcome-${idx + 1}`,
          title: `Lesson ${idx + 2}: ${outcome}`,
          youtubeUrl: course.youtubeChannelUrl,
          duration: "25 mins",
          description: `Practical hands-on implementation and exercises for: ${outcome}`,
          order: idx + 2,
        })),
      ];
    }

    // Fallback default lesson from course youtubeChannelUrl
    return [
      {
        id: "lesson-intro",
        title: `${course.title} - Full Course Overview`,
        youtubeUrl: course.youtubeChannelUrl,
        duration: course.duration || "Course Intro",
        description: course.description,
        order: 1,
      },
    ];
  }, [course]);

  // Set default active lesson if not set
  useEffect(() => {
    if (lessons.length > 0 && !activeLessonId) {
      setActiveLessonId(lessons[0].id);
    }
  }, [lessons, activeLessonId]);

  // Current Lesson & Navigation indices
  const rawIndex = lessons.findIndex((l) => l.id === activeLessonId);
  const currentIndex = rawIndex >= 0 ? rawIndex : 0;
  const activeLesson = lessons[currentIndex] || lessons[0];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < lessons.length - 1;

  // Save timestamp progress (debounced)
  const handleTimeUpdate = (seconds: number) => {
    if (!user?.uid || !courseId || !activeLesson) return;
    const rounded = Math.floor(seconds);

    // Save only if changed by at least 4 seconds to prevent excessive Firestore writes
    if (Math.abs(rounded - lastSavedTimeRef.current) < 4) return;
    lastSavedTimeRef.current = rounded;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveCourseProgress(user.uid, courseId, activeLesson.id, rounded).catch(
        (err) => console.error("Error saving progress:", err)
      );
    }, 2000);
  };

  // Immediate save when switching lesson
  const switchLesson = (targetLesson: Lesson) => {
    if (targetLesson.id === activeLessonId) return;

    if (user?.uid && courseId && activeLesson) {
      saveCourseProgress(
        user.uid,
        courseId,
        targetLesson.id,
        0
      ).catch((err) => console.error("Error saving lesson switch:", err));
    }

    setActiveLessonId(targetLesson.id);
    setInitialSeconds(0);
    setShowCurriculumMobile(false);
  };

  const handleNextLesson = () => {
    if (hasNext) {
      switchLesson(lessons[currentIndex + 1]);
    }
  };

  const handlePreviousLesson = () => {
    if (hasPrevious) {
      switchLesson(lessons[currentIndex - 1]);
    }
  };

  // Mark lesson as complete / incomplete
  const handleToggleComplete = async () => {
    if (!user?.uid || !courseId || !activeLesson) return;
    const isCurrentlyCompleted = completedIds.includes(activeLesson.id);

    try {
      const updated = await toggleLessonCompleted(
        user.uid,
        courseId,
        activeLesson.id,
        !isCurrentlyCompleted
      );
      setCompletedIds(updated);
    } catch (err) {
      console.error("Error toggling completion:", err);
    }
  };

  // When lesson video ends
  const handleLessonEnded = async () => {
    if (!user?.uid || !courseId || !activeLesson) return;

    if (!completedIds.includes(activeLesson.id)) {
      try {
        const updated = await toggleLessonCompleted(
          user.uid,
          courseId,
          activeLesson.id,
          true
        );
        setCompletedIds(updated);
      } catch (err) {
        console.error("Error marking lesson ended:", err);
      }
    }

    // Auto advance to next lesson after 2 seconds
    if (hasNext) {
      setTimeout(() => {
        handleNextLesson();
      }, 1500);
    }
  };

  // Calculate percentage
  const completedCount = completedIds.filter((id) =>
    lessons.some((l) => l.id === id)
  ).length;
  const progressPercent =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  // Loading Screen
  if (loading || authLoading || enrollmentsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090c15] text-slate-900 dark:text-slate-100 p-4 sm:p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-6xl space-y-6">
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="lg:col-span-2 aspect-video w-full rounded-xl" />
            <Skeleton className="h-[450px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Not enrolled or Not Found
  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090c15] text-slate-900 dark:text-slate-100 p-6 flex items-center justify-center">
        <EmptyState
          title="Course Not Found"
          description={error || "The course you are looking for does not exist."}
        />
      </div>
    );
  }

  const userEnrolled = user && isEnrolled(courseId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090c15] text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* Top Learning Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          {/* Back button & Course Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/student/courses"
              className="p-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Back to my courses"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="truncate">
              <h1 className="font-heading text-sm sm:text-base font-medium truncate text-slate-900 dark:text-white">
                {course.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Lesson {currentIndex + 1} of {lessons.length}:
                </span>
                <span className="truncate">{activeLesson?.title}</span>
              </p>
            </div>
          </div>

          {/* Progress Overview & Mobile Curriculum Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end gap-1 w-44">
              <div className="flex items-center justify-between w-full text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>Progress</span>
                <span className="tabular-nums font-semibold text-slate-900 dark:text-white">
                  {progressPercent}%
                </span>
              </div>
              <ProgressBar
                value={progressPercent / 100}
                label={`${course.title} overall progress`}
              />
            </div>

            {/* Mobile Curriculum Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCurriculumMobile(!showCurriculumMobile)}
              className="lg:hidden rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <ListVideo className="h-4 w-4 text-accent-500" />
              <span>Lessons ({completedCount}/{lessons.length})</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Classroom Layout */}
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="grid items-start gap-8 lg:grid-cols-3">
          {/* Left Column: Video Player & Lecture Details */}
          <div className="lg:col-span-2 space-y-6">
            {activeLesson ? (
              <CoursePlayer
                lesson={activeLesson}
                courseTitle={course.title}
                initialTimestampSeconds={initialSeconds}
                isCompleted={completedIds.includes(activeLesson.id)}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                onNextLesson={handleNextLesson}
                onPreviousLesson={handlePreviousLesson}
                onToggleComplete={handleToggleComplete}
                onTimeUpdate={handleTimeUpdate}
                onLessonEnded={handleLessonEnded}
              />
            ) : (
              <div className="aspect-video w-full neu-pressed-sm rounded-3xl flex items-center justify-center">
                <p className="text-sm text-slate-500">Select a lesson to begin.</p>
              </div>
            )}

            {/* Lesson Title & Notes Box */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Lesson {currentIndex + 1}
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-medium text-slate-900 dark:text-white mt-1">
                    {activeLesson?.title}
                  </h2>
                </div>

                {activeLesson?.duration && (
                  <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-accent-500" />
                    <span>{activeLesson.duration}</span>
                  </div>
                )}
              </div>

              {activeLesson?.description ? (
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {activeLesson.description}
                </p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                  Watch this lesson and practice hands-on to complete this topic.
                </p>
              )}

              {/* Learning Tip Card */}
              <div className="mt-4 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3.5 flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-accent-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <span className="font-medium text-slate-900 dark:text-white">
                    Auto AI Learning Tracker:
                  </span>{" "}
                  Your watch position is saved automatically. You can safely close or refresh
                  anytime, and your progress will resume right where you stopped!
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Course Curriculum Playlist */}
          <div
            className={`space-y-4 ${
              showCurriculumMobile
                ? "block fixed inset-0 z-50 p-4 bg-white dark:bg-slate-900 overflow-y-auto"
                : "hidden lg:block lg:sticky lg:top-24"
            }`}
          >
            {/* Mobile close button */}
            {showCurriculumMobile && (
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 lg:hidden">
                <h3 className="font-heading font-medium text-base text-slate-900 dark:text-white">
                  Course lessons
                </h3>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowCurriculumMobile(false)}
                  className="rounded-lg"
                >
                  Close
                </Button>
              </div>
            )}

            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-base font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-accent-500" />
                    <span>Curriculum</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {completedCount} of {lessons.length} completed
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-heading text-base font-semibold tabular-nums text-slate-900 dark:text-white">
                    {progressPercent}%
                  </span>
                </div>
              </div>

              {/* Progress bar inside sidebar */}
              <ProgressBar
                value={progressPercent / 100}
                label={`${course.title} curriculum progress`}
              />

              {/* Lesson Items List */}
              <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {lessons.map((lesson, idx) => {
                  const isActive = lesson.id === activeLessonId;
                  const isDone = completedIds.includes(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => switchLesson(lesson)}
                      className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors ${
                        isActive
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {/* Checkmark or Index */}
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <div
                            className={`h-4 w-4 rounded-md flex items-center justify-center text-[10px] font-mono ${
                              isActive
                                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                                : "border border-slate-200 dark:border-slate-700 text-slate-500"
                            }`}
                          >
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      {/* Title & Duration */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm truncate ${
                            isActive
                              ? "font-medium text-slate-900 dark:text-white"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {lesson.title}
                        </p>
                        {lesson.duration && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{lesson.duration}</span>
                          </p>
                        )}
                      </div>

                      {/* Play Indicator if active */}
                      {isActive && (
                        <div className="shrink-0 self-center">
                          <span className="h-2 w-2 rounded-full bg-accent-500 inline-block" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Completion Certificate Note */}
              {progressPercent === 100 && (
                <div className="neu-pressed-sm rounded-2xl p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                  <Trophy className="h-6 w-6 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    All Lessons Completed! 🎉
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Great job! Submit your assignments to claim your certificate.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
