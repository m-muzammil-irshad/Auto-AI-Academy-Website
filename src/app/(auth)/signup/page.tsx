import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Free to join. Start learning programming, AI, and automation.
        </p>
      </div>
      <SignupForm />
    </>
  );
}