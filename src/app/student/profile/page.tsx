"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { updateUserName } from "@/lib/services/users";
import { friendlyAuthError } from "@/lib/utils/authErrors";

export default function StudentProfilePage() {
  const { user, profile, authLoading, profileLoading, signOut } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");
  const [nameSaved, setNameSaved] = useState(false);

  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState("");

  useEffect(() => {
    if (profile) setName(profile.name);
  }, [profile]);

  if (authLoading || profileLoading || !profile || !user) {
    return <LoadingScreen />;
  }

  const isPasswordProvider = user.providerData.some(
    (p) => p.providerId === "password"
  );

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    setNameError("");
    setNameSaved(false);
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setNameError("Please enter at least 2 characters.");
      return;
    }
    setSavingName(true);
    try {
      await updateUserName(profile!.uid, trimmed);
      setNameSaved(true);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleSendResetLink() {
    setPasswordError("");
    setPasswordSaved(false);

    setSavingPassword(true);
    try {
      if (user!.email) {
        await sendPasswordResetEmail(auth, user!.email);
        setPasswordSaved(true);
      }
    } catch (err) {
      setPasswordError(friendlyAuthError(err));
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleResendVerification() {
    if (!user) return;
    setResending(true);
    setResendNotice("");
    try {
      await sendEmailVerification(user);
      setResendNotice(
        "Verification email sent. Check your inbox and spam folder."
      );
    } catch (err) {
      setResendNotice(friendlyAuthError(err));
    } finally {
      setResending(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <motion.div variants={{ hidden: { opacity: 0, y: -20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl text-slate-900 dark:text-white">
          Profile
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Manage your account details and security.
        </p>
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
        <Card className="transition-all hover:shadow-md dark:hover:shadow-accent-500/5">
          <CardHeader>
            <h2 className="font-heading text-base font-semibold text-slate-900 dark:text-white">Name</h2>
          </CardHeader>
        <CardBody>
          <form onSubmit={handleSaveName} className="space-y-3" noValidate>
            <Input
              label="Full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameSaved(false);
              }}
              error={nameError || undefined}
              disabled={savingName}
            />
            {nameSaved && (
              <p className="text-sm text-green-700">Name updated.</p>
            )}
            <div className="flex justify-end">
              <Button type="submit" size="sm" loading={savingName}>
                Save name
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
        <Card className="transition-all hover:shadow-md dark:hover:shadow-accent-500/5">
          <CardHeader>
            <h2 className="font-heading text-base font-semibold text-slate-900 dark:text-white">Email</h2>
          </CardHeader>
        <CardBody className="space-y-3">
          <Input
            label="Email address"
            value={profile.email}
            readOnly
            disabled
            hint="Email cannot be changed."
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Verification:</span>
            {user.emailVerified ? (
              <Badge variant="success">Verified</Badge>
            ) : (
              <Badge variant="warning">Not verified</Badge>
            )}
          </div>
          {!user.emailVerified && isPasswordProvider && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResendVerification}
                loading={resending}
              >
                Resend verification email
              </Button>
              {resendNotice && (
                <p className="text-sm text-slate-600 dark:text-slate-400">{resendNotice}</p>
              )}
            </>
          )}
        </CardBody>
        </Card>
      </motion.div>

      {isPasswordProvider && (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
          <Card className="transition-all hover:shadow-md dark:hover:shadow-accent-500/5">
            <CardHeader>
              <h2 className="font-heading text-base font-semibold text-slate-900 dark:text-white">
                Change password
              </h2>
            </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                For security reasons, click the button below to receive a password reset link at your registered email address.
              </p>
              
              {passwordError && (
                <div
                  role="alert"
                  className="rounded-md bg-red-50 p-3 text-sm text-red-700"
                >
                  {passwordError}
                </div>
              )}
              {passwordSaved && (
                <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-3 text-sm text-green-700 dark:text-green-400">
                  Password reset link has been sent to your email. Please check your inbox and spam folder.
                </div>
              )}
              <div className="flex justify-end pt-2">
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={handleSendResetLink}
                  loading={savingPassword}
                  disabled={passwordSaved}
                >
                  Send reset link
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
        </motion.div>
      )}

      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
        <Card className="transition-all hover:shadow-md dark:hover:shadow-accent-500/5">
          <CardBody className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-white">Sign out</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You’ll need to sign in again to access your courses.
              </p>
            </div>
            <Button variant="secondary" onClick={handleSignOut}>
              Sign out
            </Button>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}


