import { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedCourses } from "@/components/home/FeaturedCourses";
import { ValueStrip } from "@/components/home/ValueStrip";
import { LeaderboardTeaser } from "@/components/home/LeaderboardTeaser";
import { FAQ } from "@/components/home/FAQ";
import { FinalCTA } from "@/components/home/FinalCTA";
import { HomeAuthRedirect } from "@/components/home/HomeAuthRedirect";

export const metadata: Metadata = {
  title: "Auto AI Academy | Best Free AI & Python Courses Online",
  description: "Join Auto AI Academy to learn Artificial Intelligence, Python, and Automation. Get 100% free courses with verified certificates, hands-on projects, and AI support.",
  openGraph: {
    title: "Auto AI Academy | Best Free AI & Python Courses Online",
    description: "Join Auto AI Academy to learn Artificial Intelligence, Python, and Automation. Get 100% free courses with verified certificates, hands-on projects, and AI support.",
  }
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Auto AI Academy",
    "url": "https://auto-ai-academy-website.vercel.app/",
    "description": "Join Auto AI Academy to learn Artificial Intelligence, Python, and Automation. Get 100% free courses with verified certificates, hands-on projects, and AI support.",
    "sameAs": []
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeAuthRedirect />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <FeaturedCourses />
        <ValueStrip />
        <LeaderboardTeaser />
        <FAQ />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}