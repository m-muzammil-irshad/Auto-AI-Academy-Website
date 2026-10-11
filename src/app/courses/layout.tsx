import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Courses | Auto AI Academy",
  description: "Browse our complete catalog of programming, AI, and automation courses. Learn Python, Prompt Engineering, and more completely free.",
  openGraph: {
    title: "All Courses | Auto AI Academy",
    description: "Browse our complete catalog of programming, AI, and automation courses. Learn Python, Prompt Engineering, and more completely free.",
  }
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Course",
          "name": "Python for Artificial Intelligence",
          "description": "Learn Python programming tailored specifically for Artificial Intelligence applications.",
          "provider": {
            "@type": "EducationalOrganization",
            "name": "Auto AI Academy",
            "sameAs": "https://auto-ai-academy-website.vercel.app/"
          }
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
