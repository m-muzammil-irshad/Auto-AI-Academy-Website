import { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HowItWorksGuide } from "@/components/how-it-works/HowItWorksGuide";
import { DEFAULT_OG_IMAGE, ORGANIZATION_JSON_LD, absoluteUrl, seoAlternates } from "@/lib/seo";
import { SITE_KEYWORDS } from "@/lib/seoKeywords";

const TITLE = "How Auto AI Academy Works | 4 Steps to Mastery";
const DESCRIPTION =
  "Explore the 4-step framework to mastering AI, Python, and automation at Auto AI Academy: 1-click enrollment, Urdu video lessons with practice sandboxes, Google Drive assignment submissions with 5-star grading, and verified accredited certificates.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    ...SITE_KEYWORDS,
    "how it works",
    "learning framework",
    "AI assignments grading",
    "Urdu AI tutorials",
    "free Python certificate",
  ],
  alternates: seoAlternates("/how-it-works"),
  openGraph: {
    title: `${TITLE} | Auto AI Academy`,
    description: DESCRIPTION,
    url: "/how-it-works",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function HowItWorksPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Master AI and Automation at Auto AI Academy",
    "description": DESCRIPTION,
    "provider": ORGANIZATION_JSON_LD,
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Enroll in a Click",
        "text": "Choose your course and get instant LMS and community access with zero paywalls or credit cards.",
        "url": absoluteUrl("/how-it-works#step-1"),
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Learn & Practice",
        "text": "Watch structured, bite-sized Urdu/Hindi video tutorials and write code in hands-on sandboxes.",
        "url": absoluteUrl("/how-it-works#step-2"),
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Submit Assignments",
        "text": "Turn in project code via Google Drive or GitHub and receive detailed 3-tier rubric feedback and 5-star ratings.",
        "url": absoluteUrl("/how-it-works#step-3"),
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Rank & Certify",
        "text": "Climb the student cohort leaderboard and unlock tamper-proof, QR-verified digital certificates.",
        "url": absoluteUrl("/how-it-works#step-4"),
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#090c15] text-slate-900 dark:text-slate-100 transition-colors duration-150">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader />

      <main className="flex-1">
        <HowItWorksGuide />
      </main>

      <SiteFooter />
    </div>
  );
}
