"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { friendlyAuthError } from "@/lib/utils/authErrors";

export default function VerifyEmailPage() {
  const { user, profile, authLoading } = useAuth();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.emailVerified) {
      router.replace(
        profile?.role === "admin"
          ? "/admin"
          : profile?.role === "student"
            ? "/student"
            : "/login"
      );
    }
  }, [user, profile, authLoading, router]);

  async function handleResend() {
    if (!user) return;
    setSending(true);
    setNotice("");
    setError("");
    try {
      await sendEmailVerification(user);
      setNotice("Verification email sent. Check your inbox and spam folder.");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSending(false);
    }
  }

  async function handleCheck() {
    if (!user) return;
    setChecking(true);
    setNotice("");
    setError("");
    try {
      await user.reload();
      if (user.emailVerified) {
        router.replace(
          profile?.role === "admin"
            ? "/admin"
            : profile?.role === "student"
              ? "/student"
              : "/login"
        );
      } else {
        setError("Email not verified yet. Open the link in your inbox first.");
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setChecking(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    router.replace("/login");
  }

  if (authLoading) return <LoadingScreen />;

  return (
    <div className="space-y-4 text-center">
      <h1 className="font-heading text-2xl font-semibold">Verify your email</h1>
      <p className="text-sm text-slate-600">
        We sent a verification link to{" "}
        <strong className="break-all">{user?.email}</strong>. Click it to
        activate your account.
      </p>

      {notice && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          {notice}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2 pt-2">
        <Button onClick={handleCheck} loading={checking} size="lg">
          I’ve verified my email
        </Button>
        <Button
          onClick={handleResend}
          loading={sending}
          variant="secondary"
          size="lg"
        >
          Resend verification email
        </Button>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        className="pt-2 text-sm text-slate-500 hover:text-slate-700"
      >
        Sign out
      </button>
    </div>
  );
}