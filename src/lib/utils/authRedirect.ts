import type { AppUser } from "@/lib/types";

/**
 * Where a freshly authenticated user should land:
 *   admin → /admin
 *   unverified student → /verify-email
 *   verified student → /student
 * Shared by LoginForm and SignupForm so the rule lives in one place.
 */
export function routeAfterAuth(
  profile: AppUser,
  emailVerified: boolean
): "/admin" | "/student" | "/verify-email" {
  if (profile.role === "admin") return "/admin";
  if (!emailVerified) return "/verify-email";
  return "/student";
}
