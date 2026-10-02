"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { WhatsAppModal } from "./WhatsAppModal";
import type { CertificateStatus } from "@/hooks/useCertificateEligibility";

export interface CertificateRowProps {
  status: CertificateStatus;
}

export function CertificateRow({ status }: CertificateRowProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { course, eligible, reason, submittedCount, totalAssignments } =
    status;

  const progressLabel =
    totalAssignments > 0
      ? `${submittedCount} / ${totalAssignments} assignments submitted`
      : "No assignments in this course";

  return (
    <>
      <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
        <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:hover:shadow-accent-500/5">
          <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-base font-semibold text-slate-900 dark:text-white">
                  {course.title}
                </h3>
              {eligible ? (
                <Badge variant="success">Eligible</Badge>
              ) : (
                <Badge variant="neutral">Not yet eligible</Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{progressLabel}</p>
            {!eligible && reason && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{reason}</p>
            )}
          </div>

          <div className="shrink-0">
            {eligible ? (
              <Button onClick={() => setModalOpen(true)}>
                Get Certificate
              </Button>
            ) : (
              <Tooltip content={reason ?? "Not eligible yet."}>
                <Button variant="secondary" disabled>
                  Get Certificate
                </Button>
              </Tooltip>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>

      <WhatsAppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        courseTitle={course.title}
      />
    </>
  );
}