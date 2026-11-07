"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { PruneSubmissions } from "@/components/admin/PruneSubmissions";
import {
  fetchSiteSettings,
  updateWhatsAppNumber,
  DEFAULT_SETTINGS,
} from "@/lib/services/settings";
import { fetchAllSubmissions } from "@/lib/services/submissions";
import { pruneSubmissions } from "@/lib/services/cascade";
import { submissionDoc } from "@/lib/firebase/collections";
import type { Submission } from "@/lib/types";

export default function AdminSettingsPage() {
  const [whatsapp, setWhatsapp] = useState(DEFAULT_SETTINGS.whatsappNumber);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [submissionsError, setSubmissionsError] = useState("");

  const loadSettings = useCallback(async () => {
    setLoadingSettings(true);
    setSettingsError("");
    try {
      const s = await fetchSiteSettings();
      setWhatsapp(s.whatsappNumber);
    } catch (err) {
      setSettingsError(
        err instanceof Error ? err.message : "Could not load settings."
      );
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  const loadSubmissions = useCallback(async () => {
    setLoadingSubmissions(true);
    setSubmissionsError("");
    try {
      const list = await fetchAllSubmissions();
      setSubmissions(list);
    } catch (err) {
      setSubmissionsError(
        err instanceof Error ? err.message : "Could not load submissions."
      );
    } finally {
      setLoadingSubmissions(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
    void loadSubmissions();
  }, [loadSettings, loadSubmissions]);

  async function handleSaveSettings() {
    setSavingSettings(true);
    setSettingsError("");
    setSettingsSaved(false);
    try {
      await updateWhatsAppNumber(whatsapp);
      setSettingsSaved(true);
    } catch (err) {
      setSettingsError(
        err instanceof Error ? err.message : "Could not save settings."
      );
    } finally {
      setSavingSettings(false);
    }
  }

  async function handlePrune(ids: string[]) {
    const refs = ids.map((id) => submissionDoc(id));
    await pruneSubmissions(refs);
    await loadSubmissions();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Support contact and storage maintenance.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <Card className="transition-all hover:shadow-md dark:hover:shadow-accent-500/5">
        <CardHeader>
          <h2 className="font-heading text-base font-semibold text-slate-900 dark:text-white">
            WhatsApp support number
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Used by the student portal’s support icon and the certificate
            issuance popup. Digits only, with country code (no “+”).
          </p>
          {loadingSettings ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <>
              <Input
                label="Number (international format, digits only)"
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.value);
                  setSettingsSaved(false);
                }}
                placeholder="923001234567"
                error={settingsError || undefined}
                disabled={savingSettings}
              />
              {settingsSaved && (
                <div className="rounded-2xl neu-pressed-sm p-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Saved. The student portal will pick up the new number on
                  next page load.
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSettings}
                  loading={savingSettings}
                  className="neu-btn-primary rounded-full font-bold"
                >
                  Save
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>
      </motion.div>

      {/* SMTP Email Configuration Status Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        <SmtpSettingsCard />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.2 }}
      >
        <Card className="transition-all hover:shadow-md dark:hover:shadow-accent-500/5">
          <CardHeader>
            <h2 className="font-heading text-base font-semibold text-slate-900 dark:text-white">
              Prune old raw submissions
          </h2>
        </CardHeader>
        <CardBody>
          {loadingSubmissions ? (
            <Skeleton className="h-24 w-full" />
          ) : submissionsError ? (
            <EmptyState
              title="Could not load submissions"
              description={submissionsError}
            />
          ) : (
            <PruneSubmissions
              submissions={submissions}
              onPrune={handlePrune}
            />
          )}
        </CardBody>
      </Card>
      </motion.div>
    </div>
  );
}

function SmtpSettingsCard() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleTestConnection() {
    setTesting(true);
    setResult(null);
    try {
      const authUser = (await import("@/lib/firebase/config")).auth.currentUser;
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authUser?.uid,
          action: "verify_smtp",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not connect to SMTP server.");
      }

      setResult({
        success: true,
        message: "SMTP server connected and verified successfully! Your email system is ready to send.",
      });
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || "Failed to verify SMTP server.",
      });
    } finally {
      setTesting(false);
    }
  }

  return (
    <Card className="transition-all hover:shadow-md dark:hover:shadow-accent-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-base font-semibold text-slate-900 dark:text-white">
              SMTP Email Server Configuration (Nodemailer / Gmail)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Used by the Email Broadcast System to send emails directly to student inboxes.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleTestConnection}
            loading={testing}
            className="neu-btn rounded-full text-xs font-semibold px-4 cursor-pointer"
          >
            Test Connection
          </Button>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {result && (
          <div
            className={`rounded-2xl p-4 text-xs font-medium border ${
              result.success
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                : "bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300"
            }`}
          >
            {result.success ? "✅ " : "❌ "}
            {result.message}
          </div>
        )}

        <div className="rounded-2xl neu-flat-sm p-4 space-y-2 border border-black/5 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300">
          <div className="font-bold text-slate-900 dark:text-white">
            ⚙️ Required Environment Variables (.env.local):
          </div>
          <div className="font-mono text-[11px] bg-black/5 dark:bg-white/5 p-3 rounded-xl space-y-1">
            <div>SMTP_HOST=smtp.gmail.com</div>
            <div>SMTP_PORT=465</div>
            <div>SMTP_USER=your-email@gmail.com</div>
            <div>SMTP_PASS=xxxx xxxx xxxx xxxx (16-char Google App Password)</div>
            <div>SMTP_FROM_NAME=&quot;Auto AI Academy&quot;</div>
            <div>SMTP_FROM_EMAIL=your-email@gmail.com</div>
          </div>
        </div>

        <div className="rounded-2xl neu-pressed-sm p-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            🔑 How to get a Gmail 16-character App Password:
          </div>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Go to your <strong>Google Account</strong> (myaccount.google.com) → <strong>Security</strong>.</li>
            <li>Ensure <strong>2-Step Verification</strong> is enabled.</li>
            <li>In the search bar, type <strong>&quot;App passwords&quot;</strong>.</li>
            <li>Create an app named <strong>&quot;Auto AI Academy&quot;</strong> and click Create.</li>
            <li>Copy the 16-character generated password and paste it into <code>SMTP_PASS</code> in <code>.env.local</code>.</li>
          </ol>
        </div>
      </CardBody>
    </Card>
  );
}

