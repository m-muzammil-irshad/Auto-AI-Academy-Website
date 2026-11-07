import { Spinner } from "./Spinner";

export interface LoadingScreenProps {
  label?: string;
}

/** Full-width loading state used by AuthGuard, RoleGuard, and verify-email. */
export function LoadingScreen({ label = "Loading…" }: LoadingScreenProps) {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3">
      <Spinner className="h-6 w-6 text-accent-600 dark:text-accent-400" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
