"use client";

import { FormEvent, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import type { Assignment, Course } from "@/lib/types";
import type { AssignmentInput } from "@/lib/services/assignments";

export interface AssignmentFormProps {
  /** When present, form is in edit mode. Course picker is locked. */
  assignment?: Assignment;
  /** Ongoing courses available to add new assignments to. */
  courses: Course[];
  onCancel: () => void;
  onSubmit: (input: AssignmentInput) => Promise<void>;
}

function toLocalDateTimeInput(ts: Timestamp): string {
  const d = ts.toDate();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function defaultDueDateInput(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setSeconds(0, 0);
  return toLocalDateTimeInput(Timestamp.fromDate(d));
}

export function AssignmentForm({
  assignment,
  courses,
  onCancel,
  onSubmit,
}: AssignmentFormProps) {
  const isEdit = !!assignment;

  const [courseId, setCourseId] = useState(assignment?.courseId ?? "");
  const [title, setTitle] = useState(assignment?.title ?? "");
  const [description, setDescription] = useState(
    assignment?.description ?? ""
  );
  const [dueDate, setDueDate] = useState(
    assignment ? toLocalDateTimeInput(assignment.dueDate) : defaultDueDateInput()
  );
  const [deliverables, setDeliverables] = useState<string[]>(
    assignment?.deliverables.length ? assignment.deliverables : [""]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const courseOptions = courses.map((c) => ({
    value: c.id,
    label: c.title,
  }));

  function updateDeliverable(index: number, value: string) {
    setDeliverables((prev) =>
      prev.map((d, i) => (i === index ? value : d))
    );
  }

  function addDeliverable() {
    setDeliverables((prev) => [...prev, ""]);
  }

  function removeDeliverable(index: number) {
    setDeliverables((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    if (!courseId) {
      setError("Please select a course.");
      return;
    }
    if (trimmedTitle.length < 3) {
      setError("Please enter a title of at least 3 characters.");
      return;
    }
    if (!dueDate) {
      setError("Please choose a due date and time.");
      return;
    }

    const parsed = new Date(dueDate);
    if (Number.isNaN(parsed.getTime())) {
      setError("The due date is invalid.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        courseId,
        title: trimmedTitle,
        description: description.trim(),
        deliverables: deliverables.map((d) => d.trim()).filter(Boolean),
        dueDate: Timestamp.fromDate(parsed),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save the assignment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {isEdit ? (
        <div>
          <p className="mb-1 block text-sm font-medium text-slate-700">
            Course
          </p>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {courses.find((c) => c.id === courseId)?.title ?? "Course"}
            <span className="ml-2 text-xs text-slate-400">
              (cannot be changed)
            </span>
          </div>
        </div>
      ) : (
        <Select
          label="Course"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          options={courseOptions}
          placeholder="Select an ongoing course"
          required
          disabled={loading}
        />
      )}

      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        disabled={loading}
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        disabled={loading}
      />

      <Input
        label="Due date & time"
        type="datetime-local"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        hint="Submissions close at this exact time."
        required
        disabled={loading}
      />

      <div>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">
            Deliverables (optional)
          </p>
          <button
            type="button"
            onClick={addDeliverable}
            disabled={loading}
            className="text-xs font-medium text-accent-600 hover:text-accent-700 disabled:opacity-50"
          >
            + Add item
          </button>
        </div>
        <div className="space-y-2">
          {deliverables.length === 0 && (
            <p className="text-xs text-slate-500">
              No deliverables listed.
            </p>
          )}
          {deliverables.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={d}
                onChange={(e) => updateDeliverable(i, e.target.value)}
                placeholder={`e.g. Source code, Report PDF, Demo video`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => removeDeliverable(i)}
                disabled={loading}
                aria-label="Remove deliverable"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-red-600 disabled:opacity-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? "Save changes" : "Create assignment"}
        </Button>
      </div>
    </form>
  );
}