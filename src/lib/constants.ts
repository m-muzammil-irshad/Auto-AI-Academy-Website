export const SITE_NAME = "Auto AI Academy";
export const SITE_TAGLINE =
  "Learn programming, AI, and automation through structured courses.";
export const SITE_DESCRIPTION =
  "Auto AI Academy is a structured learning platform for programming, artificial intelligence, and automation — real courses, real assignments, real grading, and a leaderboard that recognizes consistent learners.";

export const WHATSAPP_NUMBER = "923292540897";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export const STUDENT_NAV = [
  { href: "/student", label: "Dashboard", icon: "home" },
  { href: "/student/courses", label: "My Courses", icon: "book" },
  { href: "/student/assignments", label: "Assignments", icon: "clipboard" },
  { href: "/student/leaderboard", label: "Leaderboard", icon: "trophy" },
  { href: "/student/certificates", label: "Certificates", icon: "award" },
  { href: "/student/notifications", label: "Notifications", icon: "bell" },
  { href: "/student/profile", label: "Profile", icon: "user" },
] as const;

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: "home" },
  { href: "/admin/courses", label: "Courses", icon: "book" },
  { href: "/admin/assignments", label: "Assignments", icon: "clipboard" },
  { href: "/admin/submissions", label: "Submissions", icon: "check" },
  { href: "/admin/students", label: "Students", icon: "users" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
] as const;

export const COURSE_STATUS_LABELS: Record<
  "ongoing" | "soon" | "completed",
  string
> = {
  ongoing: "Ongoing",
  soon: "Coming Soon",
  completed: "Completed",
};