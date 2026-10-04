import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Join Auto AI Academy to learn Python, AI, and Automation for free. Complete courses, submit assignments, get AI help, and earn certificates.",
  keywords: [
    "Auto AI Academy", 
    "Python course", 
    "Python course Pakistan", 
    "Free AI courses", 
    "Programming in Urdu", 
    "Learn Automation", 
    "Online Coding Courses",
    "Muzammil Irshad",
    "Best Python Course"
  ],
  openGraph: {
    title: "Auto AI Academy | Learn Python & AI",
    description: "Premium platform for practical tech education. Learn Python, AI, and automation completely free.",
    url: "https://auto-ai-academy-website.vercel.app/",
    siteName: "Auto AI Academy",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Auto AI Academy | Learn Python & AI",
    description: "Premium platform for practical tech education. Learn Python, AI, and automation completely free.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

import { FloatingAITutor } from "@/components/layout/FloatingAITutor";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-body transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <FloatingAITutor />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}