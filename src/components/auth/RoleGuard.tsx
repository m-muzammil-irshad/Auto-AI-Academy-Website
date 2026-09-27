"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "./AuthGuard";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import type { UserRole } from "@/lib/types";

export interface RoleGuardProps {
  required: UserRole;
  children: ReactNode;
}

/**
 * Runs *inside* AuthGuard — safe to assume a verified user exists.
 * If the Firestore profile is missing (orphaned Auth account) we sign out
 * and bounce to /login; a wrong-role user is sent to their own portal.
 */
function RoleCheck({
  required,
  children,
}: {
  required: UserRole;
  children: ReactNode;
}) {
  const { profile, profileLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (profileLoading) return;
    if (!profile) {
      void signOut().finally(() => router.replace("/login"));
      return;
    }
    if (profile.role !== required) {
      router.replace(profile.role === "admin" ? "/admin" : "/student");
    }
  }, [profile, profileLoading, required, router, signOut]);

  if (profileLoading) return <LoadingScreen />;
  if (!profile) return <LoadingScreen />;
  if (profile.role !== required) return <LoadingScreen />;
  return <>{children}</>;
}

export function RoleGuard({ required, children }: RoleGuardProps) {
  return (
    <AuthGuard>
      <RoleCheck required={required}>{children}</RoleCheck>
    </AuthGuard>
  );
}