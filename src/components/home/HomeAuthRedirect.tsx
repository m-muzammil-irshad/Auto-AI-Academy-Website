"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function HomeAuthRedirect() {
  const { user, profile, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || !user || !profile) return;
    router.replace(profile.role === "admin" ? "/admin" : "/student");
  }, [user, profile, authLoading, router]);

  return null;
}
