import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-600">
          Sign in to continue your courses.
        </p>
      </div>
      <LoginForm />
    </>
  );
}