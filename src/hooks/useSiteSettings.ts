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
  getWhatsAppCommunityUrl: (studentName?: string) => string;
  loading: boolean;
}

export function buildWhatsAppUrl(phoneNumber: string, text?: string): string {
  const clean = phoneNumber.replace(/[^\d]/g, "");
  if (!text) return `https://wa.me/${clean}`;
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
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

  const getWhatsAppCommunityUrl = (studentName?: string) => {
    const name = studentName?.trim();
    const text = name
      ? `Hello! My name is ${name}. I am a student at Auto AI Academy, please add me in the community.`
      : `Hello! My name is [Your Name]. I am a student at Auto AI Academy, please add me in the community.`;
    return buildWhatsAppUrl(settings.whatsappNumber, text);
  };

  return {
    settings,
    whatsappUrl: `https://wa.me/${settings.whatsappNumber}`,
    getWhatsAppCommunityUrl,
    loading,
  };
}
