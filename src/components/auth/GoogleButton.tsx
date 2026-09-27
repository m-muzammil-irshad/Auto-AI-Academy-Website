"use client";

import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { Button } from "@/components/ui/Button";
import { ensureUserProfile } from "@/lib/services/users";
import { friendlyAuthError } from "@/lib/utils/authErrors";
import type { AppUser } from "@/lib/types";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 010-4.2V7.06H2.18a11 11 0 000 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export interface GoogleButtonProps {
  label?: string;
  onSignedIn: (profile: AppUser) => void;
}

export function GoogleButton({
  label = "Continue with Google",
  onSignedIn,
}: GoogleButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const u = cred.user;
      const profile = await ensureUserProfile({
        uid: u.uid,
        name: u.displayName ?? u.email?.split("@")[0] ?? "Student",
        email: u.email ?? "",
      });
      onSignedIn(profile);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="secondary"
        size="lg"
        onClick={handleClick}
        loading={loading}
        className="w-full"
      >
        {!loading && <GoogleIcon />}
        {label}
      </Button>
      {error && (
        <p className="mt-2 text-center text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}