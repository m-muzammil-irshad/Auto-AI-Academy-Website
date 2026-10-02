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
  onSubmit: (input: {
    driveLink: string;
    description: string;
    isLate: boolean;
  }) => Promise<void>;
}

export function SubmissionForm({
  assignment,
  studentName,
  existingSubmission,
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
      <div className="rounded-xl border border-slate-200/50 bg-slate-50/60 p-4 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/50">
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

  // Deadline passed → locked, no form.
  if (deadlinePassed) {
    return (
      <div className="rounded-xl border border-slate-200/50 bg-slate-50/60 p-4 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/50">
        <p className="font-heading text-sm font-semibold text-slate-800 dark:text-white">
          Deadline passed
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
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
        isLate: false,
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
      className="space-y-4 rounded-xl border border-slate-200/50 bg-slate-50/40 p-4 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/50"
      noValidate
    >
      <p className="font-heading text-sm font-semibold text-slate-800 dark:text-white">
        Submit assignment
      </p>

      {error && (
        <div
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
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

      <Button type="submit" loading={loading} className="w-full sm:w-auto">
        Submit
      </Button>
    </form>
  );
}