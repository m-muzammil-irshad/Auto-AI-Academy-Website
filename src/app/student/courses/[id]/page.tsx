import { redirect } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export default function StudentCourseRedirectPage({ params }: PageProps) {
  redirect(`/student/courses/${params.id}/learn`);
}

