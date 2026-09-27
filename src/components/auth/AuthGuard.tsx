"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

/** True if the Firebase user signed in with email/password (email verification applies). */
export function isPasswordUser(user: {
  providerData: { providerId: string }[];
}): boolean {
  return user.providerData.some((p) => p.providerId === "password");
}

export interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Ensures: (1) a user is signed in, (2) password users have verified their email.
 * Does NOT check role — wrap with RoleGuard for role-specific routes.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!user.emailVerified && isPasswordUser(user)) {
      router.replace("/verify-email");
    }
  }, [user, authLoading, router]);

  if (authLoading) return <LoadingScreen />;
  if (!user) return <LoadingScreen />;
  if (!user.emailVerified && isPasswordUser(user)) return <LoadingScreen />;
  return <>{children}</>;
}