"use client";

import { useCertificateEligibility } from "@/hooks/useCertificateEligibility";
import { motion } from "framer-motion";
import { CertificateRow } from "@/components/certificates/CertificateRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export default function StudentCertificatesPage() {
  const { statuses, loading, error } = useCertificateEligibility();

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-6"
      >
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl text-slate-900 dark:text-white">
          Certificates
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Complete a course and submit at least 80% of its assignments to
          unlock your certificate.
        </p>
      </motion.div>

      {error && (
        <EmptyState title="Could not load certificates" description={error} />
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4"
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
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          className="space-y-3"
        >
          {statuses.map((s) => (
            <CertificateRow key={s.course.id} status={s} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

