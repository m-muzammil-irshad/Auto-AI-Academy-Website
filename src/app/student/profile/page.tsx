"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  updatePassword,
} from "firebase/auth";
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

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSaved(false);

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      if (user!.email) {
        const cred = EmailAuthProvider.credential(
          user!.email,
          currentPassword
        );
        await reauthenticateWithCredential(user!, cred);
      }
      await updatePassword(user!, newPassword);
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
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
            <form
              onSubmit={handleChangePassword}
              className="space-y-3"
              noValidate
            >
              <Input
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                disabled={savingPassword}
              />
              <Input
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                hint="At least 6 characters."
                disabled={savingPassword}
              />
              <Input
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={savingPassword}
              />
              {passwordError && (
                <div
                  role="alert"
                  className="rounded-md bg-red-50 p-3 text-sm text-red-700"
                >
                  {passwordError}
                </div>
              )}
              {passwordSaved && (
                <p className="text-sm text-green-700">Password updated.</p>
              )}
              <div className="flex justify-end">
                <Button type="submit" size="sm" loading={savingPassword}>
                  Update password
                </Button>
              </div>
            </form>
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


