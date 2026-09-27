import { FirebaseError } from "firebase/app";

/**
 * Maps Firebase Auth error codes to short, user-friendly messages.
 * Single source of truth — used by every auth form (login, signup,
 * Google, forgot-password, verify-email).
 */
export function friendlyAuthError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Incorrect email or password.";
      case "auth/invalid-email":
        return "That email address isn’t valid.";
      case "auth/email-already-in-use":
        return "An account with that email already exists. Try signing in instead.";
      case "auth/weak-password":
        return "Password is too weak — use at least 6 characters.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
      case "auth/popup-closed-by-user":
        return "The Google sign-in window closed before finishing.";
      case "auth/popup-blocked":
        return "Your browser blocked the Google sign-in window. Allow pop-ups and try again.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email using a different sign-in method. Sign in the original way, then link Google from your profile.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      case "auth/requires-recent-login":
        return "Please sign in again to continue.";
      case "auth/user-disabled":
        return "This account has been disabled. Contact support.";
      default:
        return err.message || "Something went wrong. Please try again.";
    }
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}
