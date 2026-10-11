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
import { DEFAULT_OG_IMAGE, ORGANIZATION_JSON_LD, SITE_URL, seoAlternates } from "@/lib/seo";

const TITLE = "Free AI & Python Courses in Urdu/Hindi | Auto AI Academy";
const DESCRIPTION =
  "Learn Artificial Intelligence, Python, and automation for free in Urdu/Hindi. Video lessons, hands-on assignments, AI support, and certificates for learners in Pakistan and India.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: seoAlternates("/"),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...ORGANIZATION_JSON_LD,
        "description": DESCRIPTION,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "name": "Auto AI Academy",
        "url": SITE_URL,
        "inLanguage": "en",
        "publisher": { "@id": ORGANIZATION_JSON_LD["@id"] },
      },
    ],
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
