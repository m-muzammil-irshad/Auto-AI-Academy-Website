"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useAssignments } from "@/hooks/useAssignments";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { NotificationList } from "@/components/notifications/NotificationList";
import { formatDate } from "@/lib/utils/dates";
import { isGraded } from "@/lib/utils/stars";

export default function StudentDashboardPage() {
  const { user, profile } = useAuth();
  const { enrollments, courseIds, loading: enrollLoading } =
    useEnrollments(user?.uid);
  const { assignments, loading: assignmentsLoading } =
    useAssignments(courseIds);
  const { submissions, loading: submissionsLoading } = useSubmissions(
    user?.uid
  );
  const { entries: leaderboard, loading: leaderboardLoading } =
    useLeaderboard("alltime");
  const { notifications, loading: notifLoading } = useNotifications(
    user?.uid,
    3
  );

  const submittedIds = new Set(submissions.map((s) => s.assignmentId));
  const pendingAssignments = assignments.filter(
    (a) => !submittedIds.has(a.id)
  );

  const gradedSubmissions = submissions
    .filter((s) => isGraded(s.grading))
    .sort(
      (a, b) =>
        (b.gradedAt?.toMillis() ?? 0) - (a.gradedAt?.toMillis() ?? 0)
    );
  const latestGraded = gradedSubmissions[0];

  const myRank = leaderboard.find((e) => e.uid === user?.uid);

  const loading =
    enrollLoading ||
    assignmentsLoading ||
    submissionsLoading ||
    leaderboardLoading;

  // Animation variants for Bento Grid items
  const itemVariant: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 300, damping: 24 } 
    }
  };

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <motion.div 
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(160px,auto)]"
      >
        {/* HERO BENTO CARD (Spans 2 cols, 2 rows) */}
        <motion.div 
          variants={itemVariant}
          className="lg:col-span-2 lg:row-span-2 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-accent-600 via-indigo-600 to-purple-700 p-8 text-white shadow-xl shadow-accent-500/20 relative overflow-hidden group"
        >
          {/* Decorative mesh glow */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl transition-transform duration-700 group-hover:scale-150" />
          
          <div className="relative z-10">
            <h1 className="font-heading text-3xl font-bold sm:text-4xl">
              Welcome back, {profile?.name?.split(" ")[0] ?? "Student"}!
            </h1>
            <p className="mt-3 text-accent-100 max-w-sm text-sm sm:text-base leading-relaxed">
              You are doing great. Keep up the momentum and jump right back into your learning journey.
            </p>
          </div>
          
          <div className="relative z-10 mt-8 flex items-center gap-4">
            <Link 
              href="/student/courses"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Continue Learning
            </Link>
          </div>
        </motion.div>

        {/* ENROLLED COURSES CARD */}
        <motion.div 
          variants={itemVariant}
          className="lg:col-span-1 lg:row-span-1 flex flex-col justify-center items-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-500/50 group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          {loading ? (
             <Skeleton className="mt-3 h-8 w-12" />
          ) : (
            <h3 className="mt-3 font-heading text-2xl font-bold text-slate-900 dark:text-white">
              {enrollments.length}
            </h3>
          )}
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
            Enrolled Courses
          </p>
        </motion.div>

        {/* LEADERBOARD RANK CARD */}
        <motion.div 
          variants={itemVariant}
          className="lg:col-span-1 lg:row-span-1 flex flex-col justify-center items-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 shadow-sm transition-all hover:shadow-md hover:border-yellow-500/50 group"
        >
          <span className="text-4xl drop-shadow-sm group-hover:rotate-12 transition-transform duration-300 inline-block">🏆</span>
          {loading ? (
            <Skeleton className="mt-3 h-8 w-16" />
          ) : (
            <h3 className="mt-3 font-heading text-2xl font-bold text-slate-900 dark:text-white">
              {myRank ? `#${myRank.rank}` : "—"}
            </h3>
          )}
          <p className="text-xs font-medium uppercase tracking-wider text-yellow-500 mt-1">
            Global Rank
          </p>
        </motion.div>

        {/* LATEST GRADE CARD */}
        <motion.div 
          variants={itemVariant}
          className="lg:col-span-1 lg:row-span-1 flex flex-col justify-center items-start rounded-3xl bg-slate-900 dark:bg-slate-950 border border-slate-800 p-6 shadow-lg text-white transition-all hover:shadow-xl hover:shadow-accent-500/10 group overflow-hidden relative"
        >
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <span className="text-8xl">⭐</span>
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 z-10">Latest Grade</p>
          {loading ? (
             <Skeleton className="mt-2 h-8 w-16 bg-slate-800" />
          ) : (
            <h3 className="mt-2 font-heading text-3xl font-bold text-accent-400 z-10">
              {latestGraded ? `${latestGraded.grading!.finalStars.toFixed(1)} ★` : "—"}
            </h3>
          )}
          {latestGraded?.gradedAt && (
             <p className="mt-2 text-xs text-slate-500 z-10">
               {formatDate(latestGraded.gradedAt)}
             </p>
          )}
        </motion.div>

        {/* PENDING ASSIGNMENTS CARD */}
        <motion.div 
          variants={itemVariant}
          className="lg:col-span-1 lg:row-span-1 flex flex-col justify-center items-start rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 shadow-sm transition-all hover:shadow-md hover:border-red-500/30 group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Tasks Due</p>
          </div>
          {loading ? (
             <Skeleton className="mt-4 h-8 w-12" />
          ) : (
            <div className="mt-4 flex items-baseline gap-2">
              <h3 className="font-heading text-3xl font-bold text-slate-900 dark:text-white">
                {pendingAssignments.length}
              </h3>
              <span className="text-sm text-slate-500">pending</span>
            </div>
          )}
        </motion.div>

        {/* RECENT NOTIFICATIONS (Spans 2 cols, 2 rows) */}
        <motion.div 
          variants={itemVariant}
          className="lg:col-span-2 lg:row-span-2 flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-white">
              Recent Notifications
            </h2>
            <Link
              href="/student/notifications"
              className="text-sm font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400"
            >
              View all
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            {notifLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState
                title="You're all caught up!"
                description="No new notifications at the moment."
              />
            ) : (
              <NotificationList items={notifications} />
            )}
          </div>
        </motion.div>

        {/* SHORTCUTS (Spans 2 cols, 1 row) */}
        <motion.div 
          variants={itemVariant}
          className="lg:col-span-2 lg:row-span-1 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 p-6 shadow-sm"
        >
          <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/student/courses" className="block">
              <div className="flex h-full items-center justify-center rounded-2xl bg-white dark:bg-slate-900 p-4 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-all hover:-translate-y-1 hover:border-accent-500/50 hover:text-accent-600 hover:shadow-md">
                My Courses
              </div>
            </Link>
            <Link href="/student/assignments" className="block">
              <div className="flex h-full items-center justify-center rounded-2xl bg-white dark:bg-slate-900 p-4 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-all hover:-translate-y-1 hover:border-accent-500/50 hover:text-accent-600 hover:shadow-md">
                Assignments
              </div>
            </Link>
            <Link href="/student/leaderboard" className="block">
              <div className="flex h-full items-center justify-center rounded-2xl bg-white dark:bg-slate-900 p-4 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-all hover:-translate-y-1 hover:border-accent-500/50 hover:text-accent-600 hover:shadow-md">
                Leaderboard
              </div>
            </Link>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
