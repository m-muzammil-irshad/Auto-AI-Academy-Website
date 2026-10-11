import type { Metadata } from "next";

/**
 * Public address of the site. Set NEXT_PUBLIC_SITE_URL when moving to a
 * custom domain so every canonical link, sitemap entry and share link follows.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://auto-ai-academy-website.vercel.app"
).replace(/\/$/, "");

/** Site-wide share image (app/opengraph-image.tsx), for pages that set their own Open Graph block. */
export const DEFAULT_OG_IMAGE = "/opengraph-image";

export const absoluteUrl =(path = "/") => `${SITE_URL}${path === "/" ? "" : path}`;

/**
 * Canonical link plus hreflang entries for a page.
 * The same English content serves both Pakistan and India, so both regional
 * codes point at the one URL.
 */
export function seoAlternates(path: string): NonNullable<Metadata["alternates"]> {
  return {
    canonical: path,
    languages: {
      "en-PK": path,
      "en-IN": path,
      "x-default": path,
    },
  };
}

/** Schema.org description of the academy, reused wherever a provider or publisher is needed. */
export const ORGANIZATION_JSON_LD = {
  "@type": "EducationalOrganization",
  "@id": `${SITE_URL}/#organization`,
  name: "Auto AI Academy",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  areaServed: [
    { "@type": "Country", name: "Pakistan" },
    { "@type": "Country", name: "India" },
  ],
} as const;
