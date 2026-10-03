"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleButton } from "./GoogleButton";
import { createUserProfile } from "@/lib/services/users";
import { friendlyAuthError } from "@/lib/utils/authErrors";
import { routeAfterAuth } from "@/lib/utils/authRedirect";
import { PasswordStrengthMeter, evaluatePasswordStrength } from "./PasswordStrengthMeter";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    const strength = evaluatePasswordStrength(password);
    if (strength === "weak") {
      setError("Please choose a stronger password (medium or strong).");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );
      try {
        await updateProfile(cred.user, { displayName: trimmedName });
        await createUserProfile({
          uid: cred.user.uid,
          name: trimmedName,
          email: trimmedEmail,
        });
        await sendEmailVerification(cred.user);
      } catch (inner) {
        // Roll back the Auth user so the email isn't left half-registered.
        try {
          await cred.user.delete();
        } catch {
          /* orphaned Auth user will be healed on next login */
        }
        throw inner;
      }
      router.replace("/verify-email");
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
        label="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="name"
        required
        disabled={loading}
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
        disabled={loading}
      />
      <div>
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          disabled={loading}
        />
        <PasswordStrengthMeter password={password} />
      </div>
      <Input
        label="Confirm password"
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        autoComplete="new-password"
        required
        disabled={loading}
      />

      <Button type="submit" size="lg" loading={loading} className="w-full">
        Create account
      </Button>

      <div className="relative my-4 text-center">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <span className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          or
        </span>
      </div>

      <GoogleButton
        label="Sign up with Google"
        onSignedIn={(profile) =>
          router.replace(routeAfterAuth(profile, true))
        }
      />

      <p className="pt-2 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}