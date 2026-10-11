import { Metadata } from "next";
import { getPublicCourse, summarize } from "@/lib/coursesPublic";
import { courseKeywords, courseSeoDescription, courseSeoTitle } from "@/lib/seoKeywords";
import { DEFAULT_OG_IMAGE, ORGANIZATION_JSON_LD, absoluteUrl, seoAlternates } from "@/lib/seo";

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

// The course page itself renders in the browser, so its title, description
// and structured data are supplied here on the server for search engines.
export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const course = await getPublicCourse(params.id);
  if (!course) return { title: "Course" };

  const path = `/courses/${course.id}`;
  const title = courseSeoTitle(course.title);
  const description = courseSeoDescription(summarize(course.description, 110));
  return {
    title,
    description,
    keywords: courseKeywords(course.title),
    alternates: seoAlternates(path),
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      images: [course.thumbnail || DEFAULT_OG_IMAGE],
    },
  };
}

export default async function CourseLayout({ params, children }: Props) {
  const course = await getPublicCourse(params.id);

  const jsonLd = course && {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": summarize(course.description, 500),
    "url": absoluteUrl(`/courses/${course.id}`),
    ...(course.thumbnail ? { "image": course.thumbnail } : {}),
    ...(course.level ? { "educationalLevel": course.level } : {}),
    "inLanguage": ["ur", "hi"],
    "keywords": courseKeywords(course.title).join(", "),
    "isAccessibleForFree": true,
    "provider": ORGANIZATION_JSON_LD,
    "offers": {
      "@type": "Offer",
      "price": 0,
      "priceCurrency": "PKR",
      "category": "Free",
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "Online",
    },
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
