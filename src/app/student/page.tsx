"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useAssignments } from "@/hooks/useAssignments";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useNotifications } from "@/hooks/useNotifications";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
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

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          Welcome back, {profile?.name?.split(" ")[0] ?? "Student"}.
        </h1>
        <p className="mt-1 text-slate-600">
          Here’s a quick look at your learning progress.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Enrolled courses"
          value={loading ? null : enrollments.length.toString()}
        />
        <StatCard
          label="Pending assignments"
          value={loading ? null : pendingAssignments.length.toString()}
        />
        <StatCard
          label="Latest grade"
          value={
            loading
              ? null
              : latestGraded
                ? `${latestGraded.grading!.finalStars.toFixed(1)} ★`
                : "—"
          }
          hint={
            latestGraded?.gradedAt
              ? `Graded ${formatDate(latestGraded.gradedAt)}`
              : undefined
          }
        />
        <StatCard
          label="All-time rank"
          value={loading ? null : myRank ? `#${myRank.rank}` : "—"}
          hint={
            myRank ? `${myRank.totalStars.toFixed(1)} stars` : undefined
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-semibold">
                  Recent notifications
                </h2>
                <Link
                  href="/student/notifications"
                  className="text-sm font-medium text-accent-600 hover:text-accent-700"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              {notifLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ) : notifications.length === 0 ? (
                <EmptyState
                  title="No notifications yet"
                  description="You’ll see updates here when you’re graded or new assignments go live."
                />
              ) : (
                <NotificationList items={notifications} />
              )}
            </CardBody>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <h2 className="font-heading text-base font-semibold">
                Shortcuts
              </h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-2">
              <Link href="/student/courses">
                <Button variant="secondary" className="w-full justify-start">
                  My Courses
                </Button>
              </Link>
              <Link href="/student/assignments">
                <Button variant="secondary" className="w-full justify-start">
                  Assignments
                </Button>
              </Link>
              <Link href="/student/leaderboard">
                <Button variant="secondary" className="w-full justify-start">
                  Leaderboard
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | null;
  hint?: string;
}) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {value === null ? (
          <Skeleton className="mt-2 h-7 w-16" />
        ) : (
          <p className="mt-1 font-heading text-2xl font-semibold text-slate-900">
            {value}
          </p>
        )}
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </CardBody>
    </Card>
  );
}