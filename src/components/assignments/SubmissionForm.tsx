"use client";

import { FormEvent, useMemo, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import {
  DRIVE_LINK_ERROR,
  isValidDriveLink,
} from "@/lib/utils/driveLink";
import { formatDateTime } from "@/lib/utils/dates";
import type { Assignment, Submission } from "@/lib/types";

export interface SubmissionFormProps {
  assignment: Assignment;
  studentName: string;
  existingSubmission: Submission | null;
  isCatchUpEligible?: boolean;
  onSubmit: (input: {
    driveLink: string;
    description: string;
    isLate: boolean;
    isCatchUp?: boolean;
  }) => Promise<void>;
}

export function SubmissionForm({
  assignment,
  studentName,
  existingSubmission,
  isCatchUpEligible = false,
  onSubmit,
}: SubmissionFormProps) {
  const [driveLink, setDriveLink] = useState("");
  const [description, setDescription] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const deadlinePassed = useMemo(() => {
    return assignment.dueDate.toMillis() < Date.now();
  }, [assignment.dueDate]);

  // Already submitted → status card, no form.
  if (existingSubmission) {
    return (
      <div className="rounded-2xl neu-pressed-sm p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-heading text-sm font-semibold text-slate-800 dark:text-white">
            Submitted
          </p>
          <Badge variant="info">
            {formatDateTime(existingSubmission.submittedAt)}
          </Badge>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          You have already submitted this assignment.
        </p>
        <a
          href={existingSubmission.driveLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block break-all text-sm font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
        >
          {existingSubmission.driveLink}
        </a>
        {existingSubmission.description && (
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">
            {existingSubmission.description}
          </p>
        )}
      </div>
    );
  }

  // Deadline passed → locked, no form (unless eligible for catch-up in a completed course).
  if (deadlinePassed && !isCatchUpEligible) {
    return (
      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 p-4">
        <p className="font-heading text-sm font-medium text-slate-800 dark:text-white">
          Deadline passed
        </p>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          This assignment is no longer accepting submissions. It closed on{" "}
          {formatDateTime(assignment.dueDate)}.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!isValidDriveLink(driveLink)) {
      setError(DRIVE_LINK_ERROR);
      return;
    }
    if (!confirmed) {
      setError("Please confirm the Drive link is shared publicly.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        driveLink: driveLink.trim(),
        description: description.trim(),
        isLate: deadlinePassed,
        isCatchUp: deadlinePassed && isCatchUpEligible,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not submit assignment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 p-4"
      noValidate
    >
      <p className="font-heading text-sm font-medium text-slate-800 dark:text-white">
        Submit assignment
      </p>

      {deadlinePassed && isCatchUpEligible && (
        <div className="rounded-lg border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 text-xs text-indigo-700 dark:text-indigo-300">
          <p className="font-medium mb-1">
            Catch-up window open for certificate
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            This course is marked as completed, but you can submit this assignment to reach the 80% submission threshold required for your official certificate. (Note: Late catch-up submissions do not affect the completed cohort leaderboard).
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="animate-shake rounded-2xl neu-pressed-sm p-4 text-sm font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <Input
        label="Your name"
        value={studentName}
        readOnly
        disabled
      />

      <Input
        label="Google Drive link"
        type="url"
        value={driveLink}
        onChange={(e) => setDriveLink(e.target.value)}
        placeholder="https://drive.google.com/file/d/..."
        hint="Make sure the file is set to “Anyone with the link can view”."
        required
        disabled={loading}
      />

      <Textarea
        label="Notes (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Anything you want the grader to know."
        rows={3}
        disabled={loading}
      />

      <Checkbox
        label="I confirm this link is set to “Anyone with the link can view”."
        checked={confirmed}
        onChange={(e) => setConfirmed(e.target.checked)}
        disabled={loading}
      />

      <Button type="submit" loading={loading} className="w-full sm:w-auto rounded-lg font-medium px-6">
        Submit assignment
      </Button>
    </form>
  );
}