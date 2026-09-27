"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_SETTINGS,
  fetchSiteSettings,
  type SiteSettings,
} from "@/lib/services/settings";

export interface UseSiteSettingsResult {
  settings: SiteSettings;
  whatsappUrl: string;
  loading: boolean;
}

/**
 * Reads settings/config once. Falls back to DEFAULT_SETTINGS if the doc
 * doesn't exist yet (first deploy, or before an admin has saved).
 */
export function useSiteSettings(): UseSiteSettingsResult {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchSiteSettings()
      .then((s) => {
        if (!cancelled) setSettings(s);
      })
      .catch(() => {
        /* keep defaults on error — never blocks render */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    settings,
    whatsappUrl: `https://wa.me/${settings.whatsappNumber}`,
    loading,
  };
}
