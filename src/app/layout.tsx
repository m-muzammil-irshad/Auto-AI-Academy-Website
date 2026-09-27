import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
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
    default: `${SITE_NAME} — Programming, AI & Automation Courses`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable}`}>
      <body className="min-h-screen font-body">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}