"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface MarkCompletedDialogProps {
  open: boolean;
  courseTitle: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function MarkCompletedDialog({
  open,
  courseTitle,
  onCancel,
  onConfirm,
}: MarkCompletedDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      await onConfirm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not mark as completed."
      );
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={loading ? () => {} : onCancel} title="Mark course as completed?">
      <div className="space-y-4">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <strong className="text-slate-900 dark:text-white">{courseTitle}</strong> will be marked as{" "}
          <strong className="text-slate-900 dark:text-white">Completed</strong>. After this:
        </p>
        <ul className="space-y-1.5 pl-5 text-sm text-slate-600 dark:text-slate-400">
          <li className="list-disc">No new enrollments will be allowed.</li>
          <li className="list-disc">
            No new assignments can be added to this course.
          </li>
          <li className="list-disc">
            Enrolled students who submitted ≥ 80% of assignments will unlock
            their certificate immediately.
          </li>
          <li className="list-disc">
            This action is one-way and cannot be undone.
          </li>
        </ul>

        {error && (
          <div
            role="alert"
            className="animate-shake rounded-2xl neu-pressed-sm p-4 text-sm font-medium text-red-600 dark:text-red-400"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading} className="rounded-full">
            Cancel
          </Button>
          <Button onClick={handleConfirm} loading={loading} className="neu-btn-primary rounded-full font-bold">
            Yes, mark completed
          </Button>
        </div>
      </div>
    </Modal>
  );
}