"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  User,
  onAuthStateChanged,
  signOut as fbSignOut,
} from "firebase/auth";
import { onSnapshot } from "firebase/firestore";
import { auth } from "@/lib/firebase/config";
import { userDoc } from "@/lib/firebase/collections";
import type { AppUser } from "@/lib/types";

interface AuthContextValue {
  /** Raw Firebase user — null when signed out. */
  user: User | null;
  /** Firestore user profile (role, stars, etc.) — null until loaded or if missing. */
  profile: AppUser | null;
  /** True while Firebase Auth is still resolving the initial session. */
  authLoading: boolean;
  /** True while we are fetching/subscribing to the profile doc. */
  profileLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setProfileLoading(true);
        // Set a generic cookie for middleware to prevent landing page flicker
        document.cookie = "has_session=true; path=/; max-age=31536000";
      } else {
        document.cookie = "has_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    const ref = userDoc(user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setProfile({ uid: snap.id, ...(snap.data() as Omit<AppUser, "uid">) });
        } else {
          setProfile(null);
        }
        setProfileLoading(false);
      },
      () => {
        setProfile(null);
        setProfileLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      authLoading,
      profileLoading,
      signOut: async () => {
        await fbSignOut(auth);
      },
    }),
    [user, profile, authLoading, profileLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  }
  return ctx;
}