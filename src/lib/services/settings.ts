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
