"use client";

import { useCertificateEligibility } from "@/hooks/useCertificateEligibility";
import { CertificateRow } from "@/components/certificates/CertificateRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export default function StudentCertificatesPage() {
  const { statuses, loading, error } = useCertificateEligibility();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          Certificates
        </h1>
        <p className="mt-1 text-slate-600">
          Complete a course and submit at least 80% of its assignments to
          unlock your certificate.
        </p>
      </div>

      {error && (
        <EmptyState title="Could not load certificates" description={error} />
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <Skeleton className="mb-2 h-5 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : statuses.length === 0 ? (
        <EmptyState
          title="You’re not enrolled in any courses yet"
          description="Enroll in a course to start working toward a certificate."
        />
      ) : (
        <div className="space-y-3">
          {statuses.map((s) => (
            <CertificateRow key={s.course.id} status={s} />
          ))}
        </div>
      )}
    </div>
  );
}