"use client";

import { useCallback, useEffect, useState } from "react";
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
      <div>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-slate-600">
          Support contact and storage maintenance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-heading text-base font-semibold">
            WhatsApp support number
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-slate-600">
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
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                  Saved. The student portal will pick up the new number on
                  next page load.
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSettings}
                  loading={savingSettings}
                >
                  Save
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-heading text-base font-semibold">
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
    </div>
  );
}