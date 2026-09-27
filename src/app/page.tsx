import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedCourses } from "@/components/home/FeaturedCourses";
import { ValueStrip } from "@/components/home/ValueStrip";
import { LeaderboardTeaser } from "@/components/home/LeaderboardTeaser";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <FeaturedCourses />
        <ValueStrip />
        <LeaderboardTeaser />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}