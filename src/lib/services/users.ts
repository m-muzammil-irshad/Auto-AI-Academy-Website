import {
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { userDoc, usersCol } from "@/lib/firebase/collections";
import type { AppUser, UserRole } from "@/lib/types";

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(userDoc(uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...(snap.data() as Omit<AppUser, "uid">) };
}

export async function createUserProfile(params: {
  uid: string;
  name: string;
  email: string;
  role?: UserRole;
}): Promise<void> {
  await setDoc(userDoc(params.uid), {
    name: params.name,
    email: params.email,
    createdAt: serverTimestamp(),
    role: params.role ?? "student",
    monthlyStars: {},
    allTimeStars: 0,
    allTimeSubmissionCount: 0,
  });
}

/**
 * Fetch a profile; if the Auth user exists but the Firestore doc does not
 * (e.g. the tab was closed mid-signup), create it as a "student".
 */
export async function ensureUserProfile(params: {
  uid: string;
  name: string;
  email: string;
}): Promise<AppUser> {
  const existing = await getUserProfile(params.uid);
  if (existing) return existing;

  await createUserProfile({ ...params, role: "student" });
  const created = await getUserProfile(params.uid);
  if (!created) {
    throw new Error("Could not create your account profile. Please try again.");
  }
  return created;
}

export async function updateUserName(uid: string, name: string): Promise<void> {
  await updateDoc(userDoc(uid), { name });
}

export async function updateUserRole(
  uid: string,
  role: UserRole
): Promise<void> {
  await updateDoc(userDoc(uid), { role });
}

/** Admin-only: list every registered user. Used by analytics + student management. */
export async function fetchAllUsers(): Promise<AppUser[]> {
  const snap = await getDocs(usersCol());
  return snap.docs.map((d) => ({
    uid: d.id,
    ...(d.data() as Omit<AppUser, "uid">),
  }));
}