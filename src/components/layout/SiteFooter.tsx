"use client";

import Link from "next/link";
import { SITE_NAME, YOUTUBE_URL } from "@/lib/constants";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAuth } from "@/hooks/useAuth";

const COLUMNS = [
  {
    title: "Learn",
    links: [
      { href: "/courses", label: "All courses" },
      { href: "/blog", label: "Blog" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#why", label: "Why us" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/signup", label: "Sign up" },
      { href: "/student", label: "Dashboard" },
    ],
  },
];

const linkClass =
  "text-sm text-slate-600 transition-colors duration-150 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white";

export function SiteFooter() {
  const { getWhatsAppCommunityUrl } = useSiteSettings();
  const { user, profile } = useAuth();
  const studentName = profile?.name || user?.displayName || "";
  const communityWhatsappUrl = getWhatsAppCommunityUrl(studentName);

  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 transition-colors">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.2fr]">
        <div>
          <p className="font-heading text-lg font-medium text-slate-900 dark:text-white">
            {SITE_NAME}
          </p>
          <p className="mt-2 max-w-xs text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Programming, AI, and automation — taught in Urdu and Hindi, completely free.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="mb-3 font-heading text-xs font-medium text-slate-900 dark:text-white">
              {column.title}
            </p>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <nav aria-label="Support">
          <p className="mb-3 font-heading text-xs font-medium text-slate-900 dark:text-white">
            Support and community
          </p>
          <ul className="space-y-2.5">
            <li>
              <Link href="/#faq" className={linkClass}>
                FAQ
              </Link>
            </li>
            <li>
              <a
                href={communityWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true">
                  <path d="M20.52 3.48A11.87 11.87 0 0012.02 0C5.4 0 .03 5.37.03 11.99c0 2.11.55 4.17 1.6 5.99L0 24l6.17-1.61a11.96 11.96 0 005.85 1.49h.01c6.61 0 11.98-5.37 11.98-11.99 0-3.2-1.25-6.22-3.49-8.41zm-8.49 18.35h-.01a9.87 9.87 0 01-5.02-1.37l-.36-.21-3.66.96.98-3.57-.24-.37a9.83 9.83 0 01-1.52-5.28c0-5.44 4.43-9.87 9.87-9.87 2.63 0 5.1 1.03 6.96 2.9a9.81 9.81 0 012.89 6.98c0 5.44-4.43 9.83-9.89 9.83zm5.42-7.36c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.28-.47-2.43-1.5-.9-.8-1.5-1.79-1.67-2.09-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.65-1.57-.89-2.15-.23-.56-.47-.48-.65-.49-.17-.01-.37-.01-.57-.01s-.52.07-.79.37c-.27.3-1.03 1.01-1.03 2.46 0 1.45 1.05 2.85 1.2 3.05.15.2 2.08 3.18 5.04 4.46.7.3 1.25.48 1.68.62.71.22 1.35.19 1.86.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
                </svg>
                WhatsApp community
              </a>
            </li>
            <li>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs font-normal text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-red-600" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
                  />
                  <path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                YouTube channel
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 px-4 py-6 text-xs text-slate-500 dark:text-slate-400 sm:flex-row">
        <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
        <nav aria-label="Legal" className="flex items-center gap-6">
          <a href="/privacy.html" className={linkClass}>
            Privacy Policy
          </a>
          <a href="/terms.html" className={linkClass}>
            Terms of Service
          </a>
        </nav>
      </div>
    </footer>
  );
}
