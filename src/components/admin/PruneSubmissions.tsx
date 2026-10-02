"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils/dates";
import type { Submission } from "@/lib/types";

export interface PruneSubmissionsProps {
  submissions: Submission[];
  onPrune: (ids: string[]) => Promise<void>;
}

const DEFAULT_DAYS = 60;

export function PruneSubmissions({
  submissions,
  onPrune,
}: PruneSubmissionsProps) {
  const [days, setDays] = useState(String(DEFAULT_DAYS));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const parsedDays = Number(days);
  const daysValid = Number.isFinite(parsedDays) && parsedDays >= 1;

  const candidates = useMemo(() => {
    if (!daysValid) return [];
    const cutoff = Date.now() - parsedDays * 24 * 60 * 60 * 1000;
    return submissions.filter((s) => {
      // Only prune submissions that were already graded — that means the
      // student's totals already include their stars, so nothing is lost.
      const graded = !!s.grading;
      return graded && s.submittedAt.toMillis() < cutoff;
    });
  }, [submissions, parsedDays, daysValid]);

  const oldest = useMemo(() => {
    if (candidates.length === 0) return null;
    return candidates.reduce((min, s) =>
      s.submittedAt.toMillis() < min.submittedAt.toMillis() ? s : min
    ).submittedAt;
  }, [candidates]);

  async function handleConfirm() {
    setLoading(true);
    setError("");
    setDone(null);
    try {
      await onPrune(candidates.map((c) => c.id));
      setDone(`${candidates.length} submission(s) permanently deleted.`);
      setConfirmOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not prune.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Permanently remove raw submission documents whose grade is already
        reflected in the student’s totals. Ungraded submissions are never
        touched. This keeps storage light on the free tier.
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Input
            label="Older than (days)"
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            error={daysValid ? undefined : "Enter a number ≥ 1."}
            disabled={loading}
          />
        </div>
        <Button
          variant="danger"
          onClick={() => setConfirmOpen(true)}
          disabled={!daysValid || candidates.length === 0 || loading}
        >
          Prune {candidates.length > 0 ? `${candidates.length} submission(s)` : ""}
        </Button>
      </div>

      <div className="rounded-md border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/60 dark:bg-slate-800/50 p-3 text-xs text-slate-600 dark:text-slate-400">
        {candidates.length === 0 ? (
          <span>
            Nothing to prune with the current setting.
          </span>
        ) : (
          <span>
            <strong>{candidates.length}</strong> graded submission(s) are
            older than {parsedDays} days
            {oldest !== null && ` — oldest from ${formatDate(oldest)}`}
            .
          </span>
        )}
      </div>

      {done && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          {done}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <Modal
        open={confirmOpen}
        onClose={loading ? () => {} : () => setConfirmOpen(false)}
        title="Prune old submissions?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <strong>{candidates.length}</strong> submission document(s) will be
            permanently deleted. Student totals (monthly + all-time stars) are
            unaffected — they were already updated when each was graded.
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Per-submission Drive links and notes will no longer be viewable in
            the admin grading screen.
          </p>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirm} loading={loading}>
              Yes, prune
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}