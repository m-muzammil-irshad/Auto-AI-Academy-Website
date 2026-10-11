// Search phrases people in Pakistan and India actually type, taken from
// Google autocomplete for both countries. They feed page titles, descriptions
// and the keywords tag; see lib/seo.ts for canonical and structured data.

/** Site-wide phrases for the keywords tag. */
export const SITE_KEYWORDS = [
  "Auto AI Academy",
  // Python
  "python course in urdu",
  "python full course in urdu",
  "learn python in urdu",
  "python for beginners in urdu",
  "python course in hindi",
  "python full course in hindi free",
  "python course in hindi with certificate",
  "free python course with certificate",
  "free python course for beginners",
  // n8n and automation
  "n8n course",
  "n8n course free",
  "n8n course in hindi",
  "n8n course in pakistan",
  "n8n tutorial for beginners",
  "ai automation course",
  "ai automation course in urdu",
  "ai automation course free with certificate",
  // AI
  "ai course in urdu",
  "ai free course in urdu",
  "ai course in hindi free with certificate",
  "free ai courses in pakistan",
  "free ai course with certificate",
  "ai agents course",
  // General
  "prompt engineering course free with certificate",
  "free online courses with certificates in pakistan",
  "free it courses in pakistan",
  "free courses in india with certificates",
];

/** Phrases for one course, chosen by the topics its title mentions. */
const TOPIC_KEYWORDS: { match: RegExp; keywords: string[] }[] = [
  {
    match: /python/i,
    keywords: [
      "python course in urdu",
      "python full course in urdu",
      "learn python in urdu",
      "python for beginners in urdu",
      "python course in hindi",
      "python full course in hindi free",
      "python course in hindi with certificate",
      "free python course with certificate",
      "free python course for beginners",
      "python course in urdu pdf",
    ],
  },
  {
    match: /n8n|automat/i,
    keywords: [
      "n8n course",
      "n8n course free",
      "n8n course in hindi",
      "n8n course in pakistan",
      "n8n tutorial for beginners",
      "n8n tutorial in hindi",
      "n8n course with certificate free",
      "ai automation course",
      "ai automation course in urdu",
      "ai automation course free with certificate",
    ],
  },
  {
    match: /\bai\b|artificial intelligence|agent|generative/i,
    keywords: [
      "ai course in urdu",
      "ai free course in urdu",
      "ai full course in urdu",
      "ai course in hindi free with certificate",
      "free ai courses in pakistan",
      "free ai course with certificate",
      "ai agents course free with certificate",
      "generative ai course in urdu",
    ],
  },
  {
    match: /prompt|chatgpt/i,
    keywords: [
      "prompt engineering course",
      "prompt engineering course free with certificate",
      "prompt engineering course in pakistan",
      "chatgpt course free",
      "chatgpt course free hindi",
    ],
  },
];

export function courseKeywords(title: string): string[] {
  const matched = TOPIC_KEYWORDS.filter((topic) => topic.match.test(title)).flatMap((topic) => topic.keywords);
  return Array.from(new Set(matched));
}

const mentionsLanguage = (text: string) => /urdu|hindi/i.test(text);

/**
 * Search-result title for a course. Course titles often carry a second half
 * after "|" or ":" that pushes the important words out of view, so keep the
 * first part and make sure the language and price, which people search by, are in it.
 */
export function courseSeoTitle(title: string): string {
  const main = title.split(/[|:]/)[0].trim();
  return mentionsLanguage(main) ? `${main} (Free)` : `${main} in Urdu/Hindi (Free)`;
}

/** Search-result description for a course: its own summary plus what searchers look for. */
export function courseSeoDescription(summary: string): string {
  const facts = mentionsLanguage(summary)
    ? "Free, with assignments and a certificate."
    : "Free course in Urdu/Hindi, with assignments and a certificate.";
  // Drop any emoji or symbols a description opens with; they waste the snippet's first characters.
  return `${facts} ${summary.replace(/^[^A-Za-z0-9]+/, "")}`;
}
