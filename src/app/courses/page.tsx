import { Metadata } from "next";
import { CoursesCatalog } from "@/components/courses/CoursesCatalog";
import { getPublicCourses, summarize } from "@/lib/coursesPublic";
import { DEFAULT_OG_IMAGE, ORGANIZATION_JSON_LD, absoluteUrl, seoAlternates } from "@/lib/seo";

const DESCRIPTION =
  "Free online courses in Python, Artificial Intelligence, and automation, with assignments and certificates. Learn from Pakistan or India at your own pace.";

export const metadata: Metadata = {
  title: "Free Online Courses: Python, AI & Automation",
  description: DESCRIPTION,
  alternates: seoAlternates("/courses"),
  openGraph: {
    title: "Free Online Courses: Python, AI & Automation | Auto AI Academy",
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
