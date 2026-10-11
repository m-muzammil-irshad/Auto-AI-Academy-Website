import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SITE_NAME } from "@/lib/constants";
import { SITE_URL } from "@/lib/seo";
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
  // Makes relative canonical, Open Graph and share-image URLs absolute.
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Learn Python, Artificial Intelligence, and automation for free with Auto AI Academy. Video lessons, assignments, AI support, and certificates for learners in Pakistan and India.",
  keywords: [
    "Auto AI Academy",
    "free AI course",
    "free Python course",
    "Python course in Urdu",
    "Python course in Hindi",
    "AI course in Urdu",
    "AI course Pakistan",
    "AI course India",
    "learn automation",
    "n8n course Urdu Hindi",
    "prompt engineering course",
    "free online course with certificate",
    "Muzammil Irshad",
  ],
  openGraph: {
    title: "Auto AI Academy | Learn Python & AI",
    description: "Learn Python, AI, and automation completely free, with assignments and certificates.",
    url: "/",
    siteName: "Auto AI Academy",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Auto AI Academy | Learn Python & AI",
    description: "Learn Python, AI, and automation completely free, with assignments and certificates.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

import { FloatingAITutor } from "@/components/layout/FloatingAITutor";
import { GoogleAnalytics } from "@next/third-parties/google";
import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-body transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
        <NextTopLoader color="#0ea5e9" showSpinner={false} />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
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
