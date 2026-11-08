"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Check,
  Send,
  Key,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
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
  fetchSmtpSettings,
  updateSmtpSettings,
  DEFAULT_SMTP_SETTINGS,
  type SmtpSettings,
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
          Support contact, SMTP email delivery, and database maintenance.
        </p>
      </motion.div>

      {/* WhatsApp Support Number Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <Card className="transition-all hover:shadow-md dark:hover:shadow-accent-500/5">
          <CardHeader>
            <h2 className="font-heading text-base font-semibold text-slate-900 dark:text-white">
              WhatsApp Support Number
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Used by the student portal’s support icon, direct community chat, and the certificate
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
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Saved. The student portal and community links will pick up the new number immediately.
                  </div>
                )}
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveSettings}
                    loading={savingSettings}
                    className="rounded-lg px-4 font-medium"
                  >
                    Save Number
                  </Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* SMTP Email Configuration Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        <SmtpSettingsCard />
      </motion.div>

      {/* Prune Submissions Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.2 }}
      >
        <Card className="transition-all hover:shadow-md dark:hover:shadow-accent-500/5">
          <CardHeader>
            <h2 className="font-heading text-base font-semibold text-slate-900 dark:text-white">
              Prune Old Raw Submissions
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [host, setHost] = useState("smtp.gmail.com");
  const [port, setPort] = useState("465");
  const [user, setUser] = useState("autoaiacademy261@gmail.com");
  const [pass, setPass] = useState("");
  const [fromName, setFromName] = useState("Auto AI Academy");
  const [fromEmail, setFromEmail] = useState("autoaiacademy261@gmail.com");

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [testEmailRecipient, setTestEmailRecipient] = useState("");
  const [testEmailResult, setTestEmailResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Load saved settings from database
  useEffect(() => {
    let mounted = true;
    async function loadSmtp() {
      try {
        const stored = await fetchSmtpSettings();
        if (mounted) {
          if (stored.host) setHost(stored.host);
          if (stored.port) setPort(String(stored.port));
          if (stored.user) setUser(stored.user);
          if (stored.pass) setPass(stored.pass);
          if (stored.fromName) setFromName(stored.fromName);
          if (stored.fromEmail) setFromEmail(stored.fromEmail);

          // Default test recipient
          if (stored.user) {
            setTestEmailRecipient(stored.user);
          }
        }
      } catch (err) {
        console.warn("Could not load stored SMTP settings:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void loadSmtp();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSaveSmtp() {
    setSaving(true);
    setSavedSuccess(false);
    setConnectionResult(null);

    try {
      await updateSmtpSettings({
        host: host.trim(),
        port: Number(port) || 465,
        user: user.trim(),
        pass: pass.trim(),
        fromName: fromName.trim(),
        fromEmail: fromEmail.trim() || user.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 5000);
    } catch (err: any) {
      setConnectionResult({
        success: false,
        message: err.message || "Failed to save SMTP settings to database.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    setTesting(true);
    setConnectionResult(null);

    try {
      const authUser = (await import("@/lib/firebase/config")).auth.currentUser;
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authUser?.uid,
          action: "verify_smtp",
          config: {
            host: host.trim(),
            port: Number(port) || 465,
            user: user.trim(),
            pass: pass.trim(),
            fromName: fromName.trim(),
            fromEmail: fromEmail.trim() || user.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not connect to SMTP server.");
      }

      setConnectionResult({
        success: true,
        message: "SMTP server connected and verified successfully! Your email system is ready.",
      });
    } catch (err: any) {
      setConnectionResult({
        success: false,
        message: err.message || "Failed to connect to SMTP server. Please check your credentials.",
      });
    } finally {
      setTesting(false);
    }
  }

  async function handleSendTestEmail() {
    if (!testEmailRecipient || !testEmailRecipient.includes("@")) {
      setTestEmailResult({
        success: false,
        message: "Please enter a valid recipient email address.",
      });
      return;
    }

    setSendingTest(true);
    setTestEmailResult(null);

    try {
      const authUser = (await import("@/lib/firebase/config")).auth.currentUser;
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authUser?.uid,
          action: "test",
          testEmail: testEmailRecipient.trim(),
          subject: "Auto AI Academy SMTP Test Email",
          body: "Congratulations! Your SMTP email configuration on Auto AI Academy is working perfectly. Broadcast emails, lifecycle updates, and announcements will now deliver directly to student inboxes.",
          config: {
            host: host.trim(),
            port: Number(port) || 465,
            user: user.trim(),
            pass: pass.trim(),
            fromName: fromName.trim(),
            fromEmail: fromEmail.trim() || user.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send test email.");
      }

      setTestEmailResult({
        success: true,
        message: `Test email delivered successfully to ${testEmailRecipient}! Please check your inbox (and spam/promotions folder).`,
      });
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        message: err.message || "Failed to deliver test email.",
      });
    } finally {
      setSendingTest(false);
    }
  }

  return (
    <Card className="transition-all hover:shadow-md dark:hover:shadow-accent-500/5">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="h-4 w-4 text-accent-500" />
              <span>Email Delivery & SMTP Configuration</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configured directly in the database. Works on both local development and live Vercel.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleTestConnection}
              loading={testing}
              disabled={loading || !user || !pass}
              className="rounded-lg text-xs font-medium cursor-pointer"
            >
              Test Connection
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveSmtp}
              loading={saving}
              disabled={loading}
              className="rounded-lg text-xs font-medium cursor-pointer"
            >
              Save Credentials
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardBody className="space-y-5">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : (
          <>
            {/* Save Status Notification */}
            {savedSuccess && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-2 animate-fade-in">
                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>
                  SMTP credentials saved successfully to secure database! Your live website can now send emails without redeploying.
                </span>
              </div>
            )}

            {/* Connection Test Result */}
            {connectionResult && (
              <div
                className={`rounded-xl border p-3.5 text-xs font-medium flex items-start gap-2.5 ${
                  connectionResult.success
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                    : "border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-300"
                }`}
              >
                {connectionResult.success ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                )}
                <span>{connectionResult.message}</span>
              </div>
            )}

            {/* Form Inputs Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Sender Gmail / SMTP Account (SMTP_USER)"
                type="email"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="autoaiacademy261@gmail.com"
                required
              />

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Google 16-Char App Password (SMTP_PASS)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder="bfsqxvsxxhkxnvev"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Do not use regular Gmail password. Generate a 16-character App Password.
                </p>
              </div>

              <Input
                label="Sender Display Name (SMTP_FROM_NAME)"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="Auto AI Academy"
              />

              <Input
                label="Sender From Email (SMTP_FROM_EMAIL)"
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="autoaiacademy261@gmail.com"
              />

              <Input
                label="SMTP Host (SMTP_HOST)"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="smtp.gmail.com"
              />

              <Input
                label="SMTP Port (SMTP_PORT)"
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="465"
              />
            </div>

            {/* Test Email Dispatch Section */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-accent-500" />
                <h4 className="font-heading text-xs font-semibold text-slate-900 dark:text-white">
                  Send a Real Test Email to Any Inbox
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verify that emails arrive in student inboxes without spam filtering.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1">
                  <input
                    type="email"
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    placeholder="Enter recipient email (e.g. cornerofcodes00@gmail.com)"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={handleSendTestEmail}
                  loading={sendingTest}
                  disabled={!testEmailRecipient || !user || !pass}
                  className="rounded-lg text-xs font-medium shrink-0 cursor-pointer"
                >
                  <Send className="h-3 w-3 mr-1.5" />
                  <span>Send Test Email</span>
                </Button>
              </div>

              {testEmailResult && (
                <div
                  className={`rounded-lg border p-3 text-xs font-medium flex items-start gap-2 ${
                    testEmailResult.success
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                      : "border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-300"
                  }`}
                >
                  {testEmailResult.success ? (
                    <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                  )}
                  <span>{testEmailResult.message}</span>
                </div>
              )}
            </div>

            {/* Quick 16-Char App Password Guide */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-accent-500" />
                <span>How to get a Gmail 16-character App Password in 60 seconds:</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
                <li>
                  Open your <strong>Google Account</strong> (myaccount.google.com) &rarr;{" "}
                  <strong>Security</strong>.
                </li>
                <li>
                  Make sure <strong>2-Step Verification</strong> is ON.
                </li>
                <li>
                  In Google Search bar at the top, type <strong>&quot;App passwords&quot;</strong>.
                </li>
                <li>
                  Create an app name like <strong>&quot;Auto AI Academy&quot;</strong> and click Create.
                </li>
                <li>
                  Copy the 16-character password (e.g. <code>bfsqxvsxxhkxnvev</code>), paste it into{" "}
                  <strong>SMTP_PASS</strong> above, and click <strong>Save Credentials</strong>.
                </li>
              </ol>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
