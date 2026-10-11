// Server-side reads of public course data for SEO (page titles, structured
// data, sitemap). Uses Firestore's REST API so no client SDK or auth is needed.

export interface PublicCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  status: string;
  level: string;
  duration: string;
  /** ISO timestamp of the last change, for the sitemap. */
  updatedAt: string;
}

type FirestoreValue = { stringValue?: string };
type FirestoreDocument = {
  name: string;
  updateTime?: string;
  fields?: Record<string, FirestoreValue>;
};

const REVALIDATE_SECONDS = 300;

const baseUrl = () =>
  `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/courses`;

function toCourse(doc: FirestoreDocument): PublicCourse {
  const f = doc.fields ?? {};
  return {
    id: doc.name.split("/").pop() ?? "",
    title: f.title?.stringValue ?? "",
    description: f.description?.stringValue ?? "",
    thumbnail: f.thumbnail?.stringValue ?? "",
    status: f.status?.stringValue ?? "",
    level: f.level?.stringValue ?? "",
    duration: f.duration?.stringValue ?? "",
    updatedAt: doc.updateTime ?? new Date().toISOString(),
  };
}

/** All courses. Returns an empty list if the database cannot be reached. */
export async function getPublicCourses(): Promise<PublicCourse[]> {
  try {
    const res = await fetch(`${baseUrl()}?pageSize=100`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) throw new Error(`Firestore responded ${res.status}`);
    const data = (await res.json()) as { documents?: FirestoreDocument[] };
    return (data.documents ?? []).map(toCourse);
  } catch (err) {
    console.warn("Could not load courses for SEO:", err instanceof Error ? err.message : err);
    return [];
  }
}

export async function getPublicCourse(id: string): Promise<PublicCourse | null> {
  try {
    const res = await fetch(`${baseUrl()}/${encodeURIComponent(id)}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return toCourse((await res.json()) as FirestoreDocument);
  } catch {
    return null;
  }
}

/** First sentence or so of a description, trimmed for a meta description. */
export function summarize(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}
