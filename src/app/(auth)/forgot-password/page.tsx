"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { friendlyAuthError } from "@/lib/utils/authErrors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
          Check your inbox
        </h1>
        <div className="neu-pressed-sm rounded-2xl p-4 text-sm text-slate-600 dark:text-slate-300">
          If an account exists for <strong className="text-slate-900 dark:text-white">{email.trim()}</strong>, we sent a
          password reset link. Open it to choose a new password.
        </div>
        <Link
          href="/login"
          className="inline-block text-sm font-semibold text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">Reset password</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Enter your email and we’ll send a reset link.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div
            role="alert"
            className="animate-shake rounded-2xl neu-pressed-sm p-4 text-sm font-medium text-red-600 dark:text-red-400"
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
        <Button type="submit" size="lg" loading={loading} className="w-full neu-btn-primary rounded-full font-bold">
          Send reset link
        </Button>
        <p className="pt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          <Link
            href="/login"
            className="font-medium text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </>
  );
}