import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Sign in to continue your courses.
        </p>
      </div>
      <LoginForm />
    </>
  );
}