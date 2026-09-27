"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleButton } from "./GoogleButton";
import { ensureUserProfile } from "@/lib/services/users";
import { friendlyAuthError } from "@/lib/utils/authErrors";
import { routeAfterAuth } from "@/lib/utils/authRedirect";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const profile = await ensureUserProfile({
        uid: cred.user.uid,
        name:
          cred.user.displayName ??
          email.trim().split("@")[0] ??
          "Student",
        email: cred.user.email ?? email.trim(),
      });
      router.replace(routeAfterAuth(profile, cred.user.emailVerified));
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
        disabled={loading}
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
        disabled={loading}
      />

      <div className="text-right">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-accent-600 hover:text-accent-700"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" size="lg" loading={loading} className="w-full">
        Sign in
      </Button>

      <div className="relative my-2 text-center">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative bg-white px-3 text-xs uppercase tracking-wide text-slate-400">
          or
        </span>
      </div>

      <GoogleButton
        onSignedIn={(profile) =>
          router.replace(routeAfterAuth(profile, true))
        }
      />

      <p className="pt-2 text-center text-sm text-slate-600">
        Don’t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-accent-600 hover:text-accent-700"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}