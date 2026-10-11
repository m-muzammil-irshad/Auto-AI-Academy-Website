import { Metadata } from "next";
import { CoursesCatalog } from "@/components/courses/CoursesCatalog";
import { getPublicCourses, summarize } from "@/lib/coursesPublic";
import { SITE_KEYWORDS } from "@/lib/seoKeywords";
import { DEFAULT_OG_IMAGE, ORGANIZATION_JSON_LD, absoluteUrl, seoAlternates } from "@/lib/seo";

const DESCRIPTION =
  "Free Python, AI, and n8n automation courses in Urdu/Hindi, with assignments and certificates. Learn online from Pakistan or India at your own pace.";

export const metadata: Metadata = {
  title: "Free Python, AI & n8n Courses in Urdu/Hindi",
  description: DESCRIPTION,
  keywords: SITE_KEYWORDS,
  alternates: seoAlternates("/courses"),
  openGraph: {
    title: "Free Python, AI & n8n Courses in Urdu/Hindi | Auto AI Academy",
    description: DESCRIPTION,
    url: "/courses",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function PublicCoursesPage() {
  // Describe the real course catalogue to search engines.
  const courses = await getPublicCourses();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": courses.map((course, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": absoluteUrl(`/courses/${course.id}`),
      "item": {
        "@type": "Course",
        "name": course.title,
        "description": summarize(course.description, 300),
        "url": absoluteUrl(`/courses/${course.id}`),
        "provider": ORGANIZATION_JSON_LD,
      },
    })),
  };

  return (
    <>
      {courses.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CoursesCatalog />
    </>
  );
}
