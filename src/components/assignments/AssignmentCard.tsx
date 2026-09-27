"use client";

import { useMemo } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils/dates";
import { isGraded } from "@/lib/utils/stars";
import { DeliverablesList } from "./DeliverablesList";
import { GradingBreakdown } from "./GradingBreakdown";
import { SubmissionForm } from "./SubmissionForm";
import type { Assignment, Submission } from "@/lib/types";

export interface AssignmentCardProps {
  assignment: Assignment;
  studentName: string;
  existingSubmission: Submission | null;
  onSubmit: (
    assignmentId: string,
    input: { driveLink: string; description: string; isLate: boolean }
  ) => Promise<void>;
}

export function AssignmentCard({
  assignment,
  studentName,
  existingSubmission,
  onSubmit,
}: AssignmentCardProps) {
  const deadlinePassed = useMemo(
    () => assignment.dueDate.toMillis() < Date.now(),
    [assignment.dueDate]
  );

  const status: "not_submitted" | "submitted" | "graded" =
    existingSubmission
      ? isGraded(existingSubmission.grading)
        ? "graded"
        : "submitted"
      : deadlinePassed
        ? "submitted" // show as closed
        : "not_submitted";

  const statusBadge = () => {
    if (existingSubmission?.grading && isGraded(existingSubmission.grading)) {
      return <Badge variant="success">Graded</Badge>;
    }
    if (existingSubmission) {
      return <Badge variant="info">Submitted</Badge>;
    }
    if (deadlinePassed) {
      return <Badge variant="neutral">Closed</Badge>;
    }
    return <Badge variant="warning">Not submitted</Badge>;
  };

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-heading text-base font-semibold text-slate-900">
              {assignment.title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Due {formatDateTime(assignment.dueDate)}
            </p>
          </div>
          {statusBadge()}
        </div>

        {assignment.description && (
          <p className="whitespace-pre-wrap text-sm text-slate-700">
            {assignment.description}
          </p>
        )}

        <DeliverablesList items={assignment.deliverables} />

        {existingSubmission?.grading && isGraded(existingSubmission.grading) && (
          <GradingBreakdown grading={existingSubmission.grading} />
        )}

        <SubmissionForm
          assignment={assignment}
          studentName={studentName}
          existingSubmission={existingSubmission}
          onSubmit={(input) => onSubmit(assignment.id, input)}
        />

        {/* status is retained in the type for future use; referenced here to
            keep the constant exhaustive and avoid unused-variable warnings. */}
        <span className="hidden" data-status={status} />
      </CardBody>
    </Card>
  );
}