"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { computeFinalStars, clampScore, CRITERIA_MAX } from "@/lib/utils/stars";
import type { Grading, Submission } from "@/lib/types";

export interface GradingFormProps {
  submission: Submission;
  onSave: (grading: Grading) => Promise<void>;
}

interface CriterionSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

function CriterionSlider({
  label,
  value,
  onChange,
  disabled,
}: CriterionSliderProps) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm font-semibold tabular-nums text-slate-900">
          {value.toFixed(1)} / {CRITERIA_MAX}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={CRITERIA_MAX}
        step={0.5}
        value={value}
        onChange={(e) => onChange(clampScore(Number(e.target.value)))}
        disabled={disabled}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}

export function GradingForm({ submission, onSave }: GradingFormProps) {
  const existing = submission.grading;

  const [correctness, setCorrectness] = useState(existing?.correctness ?? 0);
  const [creativity, setCreativity] = useState(existing?.creativity ?? 0);
  const [timeliness, setTimeliness] = useState(existing?.timeliness ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const finalStars = useMemo(
    () => computeFinalStars(correctness, creativity, timeliness),
    [correctness, creativity, timeliness]
  );

  async function handleSave() {
    setLoading(true);
    setError("");
    try {
      await onSave({
        correctness,
        creativity,
        timeliness,
        finalStars,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save grade.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-md border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-heading text-sm font-semibold text-slate-800">
          {existing ? "Update grade" : "Grade submission"}
        </p>
        <Badge variant="success">{finalStars.toFixed(1)} ★ final</Badge>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="space-y-4">
        <CriterionSlider
          label="Correctness"
          value={correctness}
          onChange={setCorrectness}
          disabled={loading}
        />
        <CriterionSlider
          label="Creativity"
          value={creativity}
          onChange={setCreativity}
          disabled={loading}
        />
        <CriterionSlider
          label="Timeliness"
          value={timeliness}
          onChange={setTimeliness}
          disabled={loading}
        />
      </div>

      <div className="flex justify-end pt-1">
        <Button onClick={handleSave} loading={loading} size="sm">
          {existing ? "Save changes" : "Save grade"}
        </Button>
      </div>
    </div>
  );
}