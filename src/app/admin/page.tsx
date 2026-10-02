"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
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
        />
        <StatCard
          label="Courses"
          value={ready ? analytics.totalCourses : null}
        />
        <StatCard
          label="Total enrollments"
          value={ready ? analytics.totalEnrollments : null}
        />
        <StatCard
          label="Total submissions"
          value={ready ? analytics.totalSubmissions : null}
        />
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
              <ul className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
                {analytics.enrollmentsPerCourse.map((row) => (
                  <li
                    key={row.courseId}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span className="truncate pr-3 text-slate-700 dark:text-slate-300">
                      {row.title}
                    </span>
                    <span className="font-medium tabular-nums text-slate-900 dark:text-white">
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
              <ul className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
                {analytics.submissionsPerAssignment.map((row) => (
                  <li
                    key={row.assignmentId}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span className="min-w-0 pr-3">
                      <span className="block truncate text-slate-700 dark:text-slate-300">
                        {row.title}
                      </span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        {row.courseTitle}
                      </span>
                    </span>
                    <span className="font-medium tabular-nums text-slate-900 dark:text-white">
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
        <CardBody className="flex flex-wrap gap-2">
          <Link href="/admin/courses">
            <Button variant="secondary">Manage courses</Button>
          </Link>
          <Link href="/admin/assignments">
            <Button variant="secondary">Manage assignments</Button>
          </Link>
          <Link href="/admin/submissions">
            <Button variant="secondary">Grade submissions</Button>
          </Link>
          <Link href="/admin/students">
            <Button variant="secondary">View students</Button>
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

