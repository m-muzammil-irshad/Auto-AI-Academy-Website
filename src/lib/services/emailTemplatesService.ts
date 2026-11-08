import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface SavedEmailTemplate {
  id: string;
  label: string;
  subject: string;
  body: string;
  createdAt?: any;
  source?: "broadcast" | "manual" | "preset";
}

export const emailTemplatesCol = () => collection(db, "email_templates");
export const emailTemplateDoc = (id: string) => doc(db, "email_templates", id);

/**
 * Fetches all saved email templates from Firestore, newest first.
 */
export async function fetchSavedEmailTemplates(): Promise<SavedEmailTemplate[]> {
  try {
    const q = query(emailTemplatesCol(), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        label: (data.label as string) || (data.subject as string) || "Untitled Template",
        subject: (data.subject as string) || "",
        body: (data.body as string) || "",
        createdAt: data.createdAt,
        source: data.source || "broadcast",
      };
    });
  } catch (err) {
    console.warn("Could not fetch saved email templates:", err);
    return [];
  }
}

/**
 * Saves a new email template. If a template with the exact same subject and body already exists,
 * it returns without creating duplicates.
 */
export async function autoSaveEmailTemplate({
  subject,
  body,
  label,
  source = "broadcast",
}: {
  subject: string;
  body: string;
  label?: string;
  source?: "broadcast" | "manual" | "preset";
}): Promise<string | null> {
  const cleanSubject = subject.trim();
  const cleanBody = body.trim();

  if (!cleanSubject || !cleanBody) {
    return null;
  }

  try {
    // Check for existing duplicate to prevent clutter
    const existing = await fetchSavedEmailTemplates();
    const duplicate = existing.find(
      (t) =>
        t.subject.trim().toLowerCase() === cleanSubject.toLowerCase() &&
        t.body.trim().toLowerCase() === cleanBody.toLowerCase()
    );

    if (duplicate) {
      return duplicate.id;
    }

    const derivedLabel =
      label?.trim() ||
      (cleanSubject.length > 45 ? `${cleanSubject.slice(0, 45)}…` : cleanSubject);

    const docRef = await addDoc(emailTemplatesCol(), {
      label: derivedLabel,
      subject: cleanSubject,
      body: cleanBody,
      source,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (err) {
    console.error("Failed to auto-save email template:", err);
    return null;
  }
}

/**
 * Deletes a saved email template by ID.
 */
export async function deleteSavedEmailTemplate(id: string): Promise<void> {
  await deleteDoc(emailTemplateDoc(id));
}
