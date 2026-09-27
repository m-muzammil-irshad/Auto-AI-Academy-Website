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
        <h1 className="font-heading text-2xl font-semibold">
          Check your inbox
        </h1>
        <p className="text-sm text-slate-600">
          If an account exists for <strong>{email.trim()}</strong>, we sent a
          password reset link. Open it to choose a new password.
        </p>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-accent-600 hover:text-accent-700"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold">Reset password</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter your email and we’ll send a reset link.
        </p>
      </div>
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
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Send reset link
        </Button>
        <p className="pt-2 text-center text-sm text-slate-600">
          <Link
            href="/login"
            className="font-medium text-accent-600 hover:text-accent-700"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </>
  );
}