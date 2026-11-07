"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { BookOpen, ClipboardCheck, GraduationCap, Users } from "lucide-react";
import { fetchCourses } from "@/lib/services/courses";
import { fetchAllUsers } from "@/lib/services/users";
import { fetchAllEnrollments } from "@/lib/services/enrollments";
import { fetchAllAssignments } from "@/lib/services/assignments";
import { fetchAllSubmissions } from "@/lib/services/submissions";
import type {
  Assignment,
  Course,
  Enrollment,
  Submission,
} from "@/lib/types";

interface Analytics {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalSubmissions: number;
  enrollmentsPerCourse: Array<{ courseId: string; title: string; count: number }>;
  submissionsPerAssignment: Array<{
    assignmentId: string;
    title: string;
    courseTitle: string;
    count: number;
  }>;
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [users, courses, enrollments, assignments, submissions] =
          await Promise.all([
            fetchAllUsers(),
            fetchCourses(),
            fetchAllEnrollments(),
            fetchAllAssignments(),
            fetchAllSubmissions(),
          ]);
        if (cancelled) return;

        const courseById = new Map<string, Course>(
          courses.map((c) => [c.id, c])
        );
        const assignmentById = new Map<string, Assignment>(
          assignments.map((a) => [a.id, a])
        );

        const enrollmentsByCourse = new Map<string, number>();
        for (const e of enrollments as Enrollment[]) {
          enrollmentsByCourse.set(
            e.courseId,
            (enrollmentsByCourse.get(e.courseId) ?? 0) + 1
          );
        }

        const submissionsByAssignment = new Map<string, number>();
        for (const s of submissions as Submission[]) {
          submissionsByAssignment.set(
            s.assignmentId,
            (submissionsByAssignment.get(s.assignmentId) ?? 0) + 1
          );
        }

        setAnalytics({
          totalUsers: users.length,
          totalCourses: courses.length,
          totalEnrollments: enrollments.length,
          totalSubmissions: submissions.length,
          enrollmentsPerCourse: courses
            .map((c) => ({
              courseId: c.id,
              title: c.title,
              count: enrollmentsByCourse.get(c.id) ?? 0,
            }))
            .sort((a, b) => b.count - a.count),
          submissionsPerAssignment: assignments
            .map((a) => ({
              assignmentId: a.id,
              title: a.title,
              courseTitle:
                courseById.get(a.courseId)?.title ?? "Unknown course",
              count: submissionsByAssignment.get(a.id) ?? 0,
            }))
            .sort((a, b) => b.count - a.count),
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load analytics."
          );
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const ready = analytics !== null;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl text-slate-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          A quick overview of platform activity.
        </p>
      </motion.div>

      {error && (
        <EmptyState title="Could not load analytics" description={error} />
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          label="Registered accounts"
          value={ready ? analytics.totalUsers : null}
          icon={<Users className="h-5 w-5 text-indigo-500" />}
        />
        <StatCard
          label="Courses"
          value={ready ? analytics.totalCourses : null}
          icon={<BookOpen className="h-5 w-5 text-emerald-500" />}
        />
        <StatCard
          label="Total enrollments"
          value={ready ? analytics.totalEnrollments : null}
          icon={<GraduationCap className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          label="Total submissions"
          value={ready ? analytics.totalSubmissions : null}
          icon={<ClipboardCheck className="h-5 w-5 text-purple-500" />}
        />
      </motion.div>

      {/* Admin AI Intelligence Co-Pilot Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        <div className="relative overflow-hidden rounded-3xl neu-flat p-5 sm:p-6 border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-transparent to-indigo-500/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                </span>
                <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Admin AI Intelligence Co-Pilot
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Live Assistant
                  </span>
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                Get real-time insights on registered students, running vs coming soon courses, student enrollment per course, active vs passed assignments, and recent submissions to grade.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-ai-tutor"));
              }}
              className="neu-btn-primary self-start md:self-auto rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold shrink-0 cursor-pointer shadow-md bg-gradient-to-r from-amber-600 to-amber-700"
            >
              💬 Open Admin AI Chat
            </Button>
          </div>

          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Quick Admin Prompts (English & Roman Urdu):
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "👥 Total Students Count", prompt: "Platform par is waqt kul kitny students registered hain?" },
                { label: "📚 Running vs Coming Soon Courses", prompt: "Is waqt kitny courses chal rahy hain aur kitny coming soon hain?" },
                { label: "🎯 Students Enrolled Per Course", prompt: "Har course me kitny kitny students enrolled hain?" },
                { label: "📝 Active vs Passed Assignments", prompt: "Kon kon si assignments is waqt chal rahi hain aur kon si guzar gayin?" },
                { label: "📥 Recent Submissions to Grade", prompt: "Is waqt kis kis student ki assignment submission aayi hui hai?" },
                { label: "⭐ How to Grade Submissions", prompt: "Student submissions ko grade karne ka kya procedure hai?" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("open-ai-tutor", { detail: { prompt: item.prompt } }));
                  }}
                  className="neu-flat-sm text-xs px-3 py-1.5 rounded-full font-medium text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <Card className="h-full transition-all hover:shadow-md dark:hover:shadow-accent-500/5">
            <CardHeader>
              <h2 className="font-heading text-base font-semibold text-slate-900 dark:text-white">
                Enrollments per course
              </h2>
            </CardHeader>
          <CardBody>
            {!ready ? (
              <BreakdownSkeleton />
            ) : analytics.enrollmentsPerCourse.length === 0 ? (
              <EmptyState
                title="No courses yet"
                description="Create your first course to see enrollment data here."
              />
            ) : (
              <ul className="divide-y divide-black/5 dark:divide-white/5">
                {analytics.enrollmentsPerCourse.map((row) => (
                  <li
                    key={row.courseId}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <span className="truncate pr-3 font-medium text-slate-700 dark:text-slate-300">
                      {row.title}
                    </span>
                    <span className="neu-pressed-sm rounded-full px-3 py-1 font-bold text-xs text-accent-600 dark:text-accent-400 tabular-nums">
                      {row.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <Card className="h-full transition-all hover:shadow-md dark:hover:shadow-accent-500/5">
            <CardHeader>
              <h2 className="font-heading text-base font-semibold text-slate-900 dark:text-white">
                Submissions per assignment
              </h2>
            </CardHeader>
          <CardBody>
            {!ready ? (
              <BreakdownSkeleton />
            ) : analytics.submissionsPerAssignment.length === 0 ? (
              <EmptyState
                title="No assignments yet"
                description="Add assignments to your courses to see submission data here."
              />
            ) : (
              <ul className="divide-y divide-black/5 dark:divide-white/5">
                {analytics.submissionsPerAssignment.map((row) => (
                  <li
                    key={row.assignmentId}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <span className="min-w-0 pr-3">
                      <span className="block truncate font-medium text-slate-700 dark:text-slate-300">
                        {row.title}
                      </span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        {row.courseTitle}
                      </span>
                    </span>
                    <span className="neu-pressed-sm rounded-full px-3 py-1 font-bold text-xs text-accent-600 dark:text-accent-400 tabular-nums">
                      {row.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
          </Card>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <Card className="transition-all hover:shadow-md dark:hover:shadow-accent-500/5">
          <CardHeader>
            <h2 className="font-heading text-base font-semibold text-slate-900 dark:text-white">
              Quick actions
            </h2>
          </CardHeader>
        <CardBody className="flex flex-wrap gap-3">
          <Link href="/admin/courses">
            <Button variant="secondary" className="rounded-full neu-btn font-semibold">Manage courses</Button>
          </Link>
          <Link href="/admin/assignments">
            <Button variant="secondary" className="rounded-full neu-btn font-semibold">Manage assignments</Button>
          </Link>
          <Link href="/admin/submissions">
            <Button variant="secondary" className="rounded-full neu-btn font-semibold">Grade submissions</Button>
          </Link>
          <Link href="/admin/broadcast">
            <Button variant="secondary" className="rounded-full neu-btn font-semibold">Email broadcast</Button>
          </Link>
          <Link href="/admin/students">
            <Button variant="secondary" className="rounded-full neu-btn font-semibold">View students</Button>
          </Link>
          <Link href="/admin/blog">
            <Button variant="secondary" className="rounded-full neu-btn font-semibold">Manage blog</Button>
          </Link>
        </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}

function BreakdownSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  );
}

