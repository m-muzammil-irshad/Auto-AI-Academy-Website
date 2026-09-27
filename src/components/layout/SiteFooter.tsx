"use client";

import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function SiteFooter() {
  const { whatsappUrl } = useSiteSettings();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-heading text-base font-semibold text-slate-900">
            {SITE_NAME}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Programming, AI, and automation — taught properly.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-slate-900">
            Home
          </Link>
          <Link href="/courses" className="hover:text-slate-900">
            Courses
          </Link>
          <Link href="/login" className="hover:text-slate-900">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-slate-900">
            Sign up
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Support on WhatsApp"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-green-600 hover:bg-green-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M20.52 3.48A11.87 11.87 0 0012.02 0C5.4 0 .03 5.37.03 11.99c0 2.11.55 4.17 1.6 5.99L0 24l6.17-1.61a11.96 11.96 0 005.85 1.49h.01c6.61 0 11.98-5.37 11.98-11.99 0-3.2-1.25-6.22-3.49-8.41zm-8.49 18.35h-.01a9.87 9.87 0 01-5.02-1.37l-.36-.21-3.66.96.98-3.57-.24-.37a9.83 9.83 0 01-1.52-5.28c0-5.44 4.43-9.87 9.87-9.87 2.63 0 5.1 1.03 6.96 2.9a9.81 9.81 0 012.89 6.98c0 5.44-4.43 9.83-9.89 9.83zm5.42-7.36c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.28-.47-2.43-1.5-.9-.8-1.5-1.79-1.67-2.09-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.65-1.57-.89-2.15-.23-.56-.47-.48-.65-.49-.17-.01-.37-.01-.57-.01s-.52.07-.79.37c-.27.3-1.03 1.01-1.03 2.46 0 1.45 1.05 2.85 1.2 3.05.15.2 2.08 3.18 5.04 4.46.7.3 1.25.48 1.68.62.71.22 1.35.19 1.86.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
            </svg>
          </a>
        </nav>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}