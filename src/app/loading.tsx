import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <Skeleton className="mb-6 h-8 w-64" />
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="mb-4 h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}