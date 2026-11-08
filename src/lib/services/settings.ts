import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { WHATSAPP_NUMBER } from "@/lib/constants";

const SETTINGS_DOC_PATH = ["settings", "config"] as const;

export interface SiteSettings {
  whatsappNumber: string;
  updatedAt?: unknown;
}

/** Default values — used if the settings doc has never been written. */
export const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber: WHATSAPP_NUMBER,
};

function settingsRef() {
  return doc(db, SETTINGS_DOC_PATH[0], SETTINGS_DOC_PATH[1]);
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const snap = await getDoc(settingsRef());
  if (!snap.exists()) return DEFAULT_SETTINGS;
  const data = snap.data() as Partial<SiteSettings>;
  return {
    whatsappNumber:
      typeof data.whatsappNumber === "string" && data.whatsappNumber.trim()
        ? data.whatsappNumber.trim()
        : DEFAULT_SETTINGS.whatsappNumber,
    updatedAt: data.updatedAt,
  };
}

export async function updateWhatsAppNumber(
  whatsappNumber: string
): Promise<void> {
  const trimmed = whatsappNumber.trim().replace(/[^\d]/g, "");
  if (trimmed.length < 8) {
    throw new Error("Enter a valid WhatsApp number in international format (digits only).");
  }
  await setDoc(
    settingsRef(),
    { whatsappNumber: trimmed, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export interface SmtpSettings {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  updatedAt?: unknown;
}

export const DEFAULT_SMTP_SETTINGS: SmtpSettings = {
  host: "smtp.gmail.com",
  port: 465,
  user: "",
  pass: "",
  fromName: "Auto AI Academy",
  fromEmail: "",
};

function smtpSettingsRef() {
  return doc(db, "admin_settings", "smtp");
}

export async function fetchSmtpSettings(): Promise<SmtpSettings> {
  const snap = await getDoc(smtpSettingsRef());
  if (!snap.exists()) return DEFAULT_SMTP_SETTINGS;
  const data = snap.data() as Partial<SmtpSettings>;
  return {
    host: typeof data.host === "string" && data.host.trim() ? data.host.trim() : DEFAULT_SMTP_SETTINGS.host,
    port: Number(data.port) || DEFAULT_SMTP_SETTINGS.port,
    user: typeof data.user === "string" ? data.user.trim() : "",
    pass: typeof data.pass === "string" ? data.pass.trim() : "",
    fromName: typeof data.fromName === "string" && data.fromName.trim() ? data.fromName.trim() : DEFAULT_SMTP_SETTINGS.fromName,
    fromEmail: typeof data.fromEmail === "string" ? data.fromEmail.trim() : "",
    updatedAt: data.updatedAt,
  };
}

export async function updateSmtpSettings(settings: Partial<SmtpSettings>): Promise<void> {
  await setDoc(
    smtpSettingsRef(),
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
