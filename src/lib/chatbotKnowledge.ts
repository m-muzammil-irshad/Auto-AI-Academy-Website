import { fetchCourses } from "@/lib/services/courses";
import { fetchAllAssignments } from "@/lib/services/assignments";
import { getPublishedPosts } from "@/lib/blogPublic";
import { fetchSiteSettings } from "@/lib/services/settings";
import { FAQS } from "@/lib/faqs";
import { formatDateTime, formatDate, relativeTime, isPast } from "@/lib/utils/dates";
import type { Assignment, Course } from "@/lib/types";

export interface AdminIntelligenceData {
  users: Array<{
    uid: string;
    name: string;
    email: string;
    role: string;
    allTimeStars: number;
    allTimeSubmissionCount: number;
    createdAt?: string;
  }>;
  courses: Array<{
    id: string;
    title: string;
    status: string;
    level: string;
    duration: string;
    lessonCount: number | null;
  }>;
  enrollments: Array<{
    courseId: string;
    userId: string;
  }>;
  assignments: Array<{
    id: string;
    courseId: string;
    title: string;
    dueDateMillis: number;
    deliverables: string[];
    description: string;
  }>;
  submissions: Array<{
    id: string;
    assignmentId: string;
    userId: string;
    studentName: string;
    submittedAtMillis: number;
    isLate: boolean;
    isGraded: boolean;
    finalStars?: number;
    correctness?: number;
    creativity?: number;
    timeliness?: number;
    driveLink: string;
    description: string;
  }>;
}

export interface ChatbotContextOptions {
  userName?: string | null;
  userId?: string | null;
  isRegistered?: boolean;
  isAdmin?: boolean;
  adminIntelligenceData?: AdminIntelligenceData;
  enrolledCourseIds?: string[];
  studentContext?: {
    enrolledCourses?: { id: string; title: string }[];
    activeAssignments?: {
      id: string;
      title: string;
      courseId: string;
      courseTitle: string;
      description: string;
      deliverables: string[];
      dueDate?: string;
    }[];
  };
}

/**
 * Builds the comprehensive knowledge base and triple-mode system prompt
 * for the Auto AI Academy Chatbot.
 */
export async function buildChatbotSystemPrompt(
  input?: ChatbotContextOptions | string | null
): Promise<string> {
  const options: ChatbotContextOptions =
    typeof input === "string" || input === null || input === undefined
      ? { userName: input, isRegistered: Boolean(input) }
      : input;

  const isAdmin = Boolean(options.isAdmin);
  const isRegistered = Boolean(options.isRegistered || options.userName || isAdmin);
  const userName = options.userName || null;

  // 1. Crawl dynamic courses from Firestore
  let coursesText = "No courses currently available.";
  let courses: Course[] = [];
  const courseTitleMap = new Map<string, string>();
  try {
    courses = await fetchCourses();
    if (courses.length > 0) {
      courses.forEach((c) => courseTitleMap.set(c.id, c.title));
      coursesText = courses
        .map((c, i) => {
          const outcomesList = c.outcomes?.length
            ? c.outcomes.map((o) => `    * ${o}`).join("\n")
            : "    * Practical hands-on skills";
          const statusLabel =
            c.status === "ongoing"
              ? "Ongoing (Enrollment Open)"
              : c.status === "soon"
              ? "Coming Soon"
              : "Completed";

          return `Course ${i + 1}: ${c.title}
  - Course ID: ${c.id}
  - URL: /courses/${c.id}
  - Status: ${statusLabel}
  - Skill Level: ${c.level ? c.level : "All Levels"}
  - Duration: ${c.duration || "Self-paced"}
  - Total Lessons: ${c.lessonCount ?? "Multiple video modules"}
  - Description: ${c.description}
  - What Students Will Learn:
${outcomesList}
  - Video Lessons YouTube: ${c.youtubeChannelUrl}
  - Course Outline URL: ${c.outlineUrl || "Available on the course page"}`;
        })
        .join("\n\n");
    }
  } catch (err) {
    console.error("Error crawling courses for chatbot:", err);
  }

  // 2. Crawl dynamic assignments
  let assignmentsText = "No active assignments posted at the moment.";
  let assignments: Assignment[] = [];
  const assignmentMap = new Map<string, Assignment>();
  try {
    assignments = await fetchAllAssignments();
    if (assignments.length > 0) {
      assignments.forEach((a) => assignmentMap.set(a.id, a));
      assignmentsText = assignments
        .map((a, i) => {
          const deliverablesList = a.deliverables?.length
            ? a.deliverables.map((d) => `    - ${d}`).join("\n")
            : "    - See assignment description";
          const courseTitle = courseTitleMap.get(a.courseId) || a.courseId;
          const status = isPast(a.dueDate) ? "Deadline Passed (Guzar gayi)" : "Ongoing / Active (Chal rahi hai)";
          return `Assignment ${i + 1}: ${a.title}
  - Course: ${courseTitle} (ID: ${a.courseId})
  - Assignment ID: ${a.id}
  - Status: ${status}
  - Due Date & Time: ${formatDateTime(a.dueDate)}
  - Description / Problem Statement: ${a.description}
  - Required Deliverables:
${deliverablesList}`;
        })
        .join("\n\n");
    }
  } catch (err) {
    console.error("Error crawling assignments for chatbot:", err);
  }

  // If client provided active assignments in context, include them if available
  if (options.studentContext?.activeAssignments?.length) {
    const activeList = options.studentContext.activeAssignments
      .map((a, i) => {
        const deliv = a.deliverables?.length
          ? a.deliverables.map((d) => `    - ${d}`).join("\n")
          : "    - Check details on /student/assignments";
        return `Active Assignment ${i + 1}: "${a.title}"
  - Course: ${a.courseTitle}
  - Due Date: ${a.dueDate || "Standard deadline"}
  - Problem Details: ${a.description}
  - Deliverables:
${deliv}`;
      })
      .join("\n\n");
    assignmentsText = `${assignmentsText}\n\n[STUDENT ACTIVE ASSIGNMENTS CONTEXT]:\n${activeList}`;
  }

  // 3. Crawl published blog articles
  let blogText = "No blog posts currently published.";
  try {
    const posts = await getPublishedPosts();
    if (posts.length > 0) {
      blogText = posts
        .map(
          (p, i) =>
            `Article ${i + 1}: "${p.title}"
  - URL: /blog/${p.slug}
  - Category: ${p.category}
  - Author: ${p.author}
  - Summary: ${p.excerpt}`
        )
        .join("\n\n");
    }
  } catch (err) {
    console.error("Error crawling blog posts for chatbot:", err);
  }

  // 4. Fetch dynamic site settings
  let whatsappNumber = "923292540897";
  try {
    const settings = await fetchSiteSettings();
    if (settings.whatsappNumber) whatsappNumber = settings.whatsappNumber;
  } catch (err) {
    console.error("Error fetching site settings for chatbot:", err);
  }

  // 5. Structure Official FAQs
  const faqsText = FAQS.map(
    (faq, i) => `Q${i + 1}: ${faq.q}\nA: ${faq.a}`
  ).join("\n\n");

  // Enrolled courses summary for registered students
  let enrolledCoursesSummary = "Enrolled courses will be reflected upon enrollment.";
  if (options.studentContext?.enrolledCourses?.length) {
    enrolledCoursesSummary = options.studentContext.enrolledCourses
      .map((c) => `- ${c.title} (ID: ${c.id})`)
      .join("\n");
  } else if (options.enrolledCourseIds?.length) {
    enrolledCoursesSummary = options.enrolledCourseIds
      .map((id) => `- ${courseTitleMap.get(id) || id}`)
      .join("\n");
  }

  // 6. BUILD LIVE REAL-TIME ADMIN INTELLIGENCE SECTION
  let adminIntelligenceSection = "";
  if (isAdmin) {
    const adminData = options.adminIntelligenceData;

    if (adminData) {
      const rawUsers = adminData.users || [];
      const rawCourses = adminData.courses || [];
      const rawEnrollments = adminData.enrollments || [];
      const rawAssignments = adminData.assignments || [];
      const rawSubmissions = adminData.submissions || [];

      const userMap = new Map(rawUsers.map((u) => [u.uid, u]));
      const adminCourseMap = new Map(rawCourses.map((c) => [c.id, c]));
      const adminAssignmentMap = new Map(rawAssignments.map((a) => [a.id, a]));

      const students = rawUsers.filter((u) => u.role === "student");
      const admins = rawUsers.filter((u) => u.role === "admin");

      // Enrollment aggregation per course
      const enrollmentsByCourse = new Map<string, { count: number; studentNames: string[] }>();
      rawCourses.forEach((c) => {
        enrollmentsByCourse.set(c.id, { count: 0, studentNames: [] });
      });
      rawEnrollments.forEach((e) => {
        const item = enrollmentsByCourse.get(e.courseId) || { count: 0, studentNames: [] };
        item.count++;
        const student = userMap.get(e.userId);
        const name = student?.name || e.userId;
        if (name && !item.studentNames.includes(name)) {
          item.studentNames.push(name);
        }
        enrollmentsByCourse.set(e.courseId, item);
      });

      // Course status breakdown
      const ongoingCourses = rawCourses.filter((c) => c.status === "ongoing");
      const soonCourses = rawCourses.filter((c) => c.status === "soon");
      const completedCourses = rawCourses.filter((c) => c.status === "completed");

      const coursesBreakdownText = `TOTAL COURSES IN DATABASE: ${rawCourses.length}
- ONGOING / LIVE COURSES (${ongoingCourses.length}):
${
  ongoingCourses.length > 0
    ? ongoingCourses
        .map(
          (c) =>
            `  * Course Name: "${c.title}"
    - Course ID: ${c.id}
    - Status: Ongoing / Live
    - EXACT Enrolled Students Count: ${enrollmentsByCourse.get(c.id)?.count || 0}
    - Lessons: ${c.lessonCount ?? "N/A"} | Duration: ${c.duration || "Self-paced"}
    - URL: /courses/${c.id}`
        )
        .join("\n\n")
    : "  * None currently ongoing."
}

- COMING SOON COURSES (${soonCourses.length}):
${
  soonCourses.length > 0
    ? soonCourses
        .map(
          (c) =>
            `  * Course Name: "${c.title}"
    - Course ID: ${c.id}
    - Status: Coming Soon
    - Enrolled Students: ${enrollmentsByCourse.get(c.id)?.count || 0}
    - Level: ${c.level || "All"}`
        )
        .join("\n\n")
    : "  * None coming soon."
}

- COMPLETED COURSES (${completedCourses.length}):
${
  completedCourses.length > 0
    ? completedCourses
        .map(
          (c) =>
            `  * Course Name: "${c.title}" (ID: ${c.id}) | Enrolled: ${
              enrollmentsByCourse.get(c.id)?.count || 0
            }`
        )
        .join("\n\n")
    : "  * None marked as completed."
}`;

      // Detailed enrollment per course
      const courseEnrollmentsDetailed = rawCourses
        .map((c) => {
          const data = enrollmentsByCourse.get(c.id) || { count: 0, studentNames: [] };
          const studentList =
            data.studentNames.length > 0
              ? data.studentNames.join(", ")
              : "0 students currently enrolled (No enrollments yet)";
          return `Course: "${c.title}"
  - Course ID: ${c.id}
  - Status: ${c.status}
  - EXACT Enrolled Students Count: ${data.count}
  - Enrolled Student Names: ${studentList}`;
        })
        .join("\n\n");

      // Assignments breakdown
      const nowMs = Date.now();
      const activeAssignments = rawAssignments.filter((a) => a.dueDateMillis >= nowMs);
      const passedAssignments = rawAssignments.filter((a) => a.dueDateMillis < nowMs);

      // Submissions mapping by assignment
      const submissionsByAssignment = new Map<string, number>();
      rawSubmissions.forEach((s) => {
        submissionsByAssignment.set(
          s.assignmentId,
          (submissionsByAssignment.get(s.assignmentId) || 0) + 1
        );
      });

      const activeAssignmentsText =
        activeAssignments.length > 0
          ? activeAssignments
              .map((a, i) => {
                const subCount = submissionsByAssignment.get(a.id) || 0;
                const cTitle = adminCourseMap.get(a.courseId)?.title || a.courseId;
                const dueDateFormatted = new Date(a.dueDateMillis).toLocaleString();
                const diffDays = Math.ceil((a.dueDateMillis - nowMs) / (1000 * 60 * 60 * 24));
                return `  ${i + 1}. Assignment: "${a.title}"
     - Course: ${cTitle} (ID: ${a.courseId})
     - Assignment ID: ${a.id}
     - Due Date: ${dueDateFormatted} (Active - ${diffDays} day${diffDays === 1 ? "" : "s"} remaining)
     - Submissions Received: ${subCount}
     - Deliverables: ${a.deliverables.join(", ") || "Standard"}`;
              })
              .join("\n\n")
          : "  There are currently 0 active assignments with future deadlines.";

      const passedAssignmentsText =
        passedAssignments.length > 0
          ? passedAssignments
              .map((a, i) => {
                const subCount = submissionsByAssignment.get(a.id) || 0;
                const cTitle = adminCourseMap.get(a.courseId)?.title || a.courseId;
                const dueDateFormatted = new Date(a.dueDateMillis).toLocaleString();
                return `  ${i + 1}. Assignment: "${a.title}"
     - Course: ${cTitle} (ID: ${a.courseId})
     - Assignment ID: ${a.id}
     - Deadline Passed: ${dueDateFormatted} (EXPIRED)
     - Total Submissions Received: ${subCount}`;
              })
              .join("\n\n")
          : "  There are 0 expired assignments.";

      // Submissions queue
      const pendingSubmissions = rawSubmissions.filter((s) => !s.isGraded);
      const gradedSubmissions = rawSubmissions.filter((s) => s.isGraded);

      const sortedSubmissions = [...rawSubmissions].sort(
        (a, b) => b.submittedAtMillis - a.submittedAtMillis
      );

      const recentSubmissionsList = sortedSubmissions.slice(0, 30).map((s, i) => {
        const aInfo = adminAssignmentMap.get(s.assignmentId);
        const aTitle = aInfo?.title || s.assignmentId;
        const cTitle = adminCourseMap.get(aInfo?.courseId || "")?.title || "Course";
        const gradeStatus = s.isGraded
          ? `Graded (${s.finalStars ?? 0}★ [Correctness: ${s.correctness ?? 0}, Creativity: ${s.creativity ?? 0}, Timeliness: ${s.timeliness ?? 0}])`
          : "⚠️ PENDING GRADING (Awaiting Admin Review)";
        const timeliness = s.isLate ? "LATE submission" : "On-Time submission";
        const subDate = s.submittedAtMillis
          ? new Date(s.submittedAtMillis).toLocaleString()
          : "Unknown time";

        return `  ${i + 1}. Student: ${s.studentName || "Anonymous"} (User ID: ${s.userId})
     - Assignment: "${aTitle}" in ${cTitle}
     - Submitted At: ${subDate}
     - Status: ${gradeStatus}
     - Timeliness: ${timeliness}
     - Drive Link: ${s.driveLink || "No link"}
     - Student Note: "${s.description || "None"}"`;
      });

      const studentRosterPreview =
        rawUsers.length > 0
          ? rawUsers
              .map(
                (u, i) =>
                  `  ${i + 1}. ${u.name} | Role: ${u.role} | Email: ${u.email} | Stars: ${u.allTimeStars || 0}★ | Submissions: ${u.allTimeSubmissionCount || 0}`
              )
              .join("\n")
          : "  0 registered users in database.";

      adminIntelligenceSection = `
================================================================================
⭐ VERIFIED REAL-TIME FIRESTORE DATABASE (100% GROUND TRUTH)
================================================================================

1. PLATFORM SUMMARY (EXACT NUMBERS):
- Total Registered Users: ${rawUsers.length}
- Total Students (role === 'student'): ${students.length}
- Total Admins (role === 'admin'): ${admins.length}
- Total Course Enrollments across platform: ${rawEnrollments.length}
- Total Assignments: ${rawAssignments.length}
- Total Submissions: ${rawSubmissions.length}
- Submissions Pending Grading: ${pendingSubmissions.length}
- Submissions Graded: ${gradedSubmissions.length}

2. REAL REGISTERED USER DIRECTORY:
${studentRosterPreview}

3. REAL COURSES BREAKDOWN (RUNNING VS COMING SOON):
${coursesBreakdownText}

4. REAL COURSE ENROLLMENTS (STUDENTS PER SPECIFIC COURSE):
${courseEnrollmentsDetailed}

5. REAL ASSIGNMENTS (ACTIVE VS PASSED DEADLINE):
A. CHAL RAHI HAIN / ONGOING ASSIGNMENTS (Active Deadlines - ${activeAssignments.length} active):
${activeAssignmentsText}

B. GUZR GYI / PASSED ASSIGNMENTS (Past Deadlines - ${passedAssignments.length} expired):
${passedAssignmentsText}

6. REAL SUBMISSIONS QUEUE & WHO SUBMITTED RECENTLY:
Total Submissions Received: ${rawSubmissions.length}
Pending Review/Grading: ${pendingSubmissions.length}
Graded: ${gradedSubmissions.length}

LATEST SUBMISSIONS LOG:
${
  recentSubmissionsList.length > 0
    ? recentSubmissionsList.join("\n\n")
    : "  No student submissions recorded in database yet (0 submissions)."
}

7. ONLY VALID ADMIN ROUTES (DO NOT INVENT ANY OTHER ROUTES):
- Dashboard Overview: /admin
- Manage Courses: /admin/courses
- Manage Assignments: /admin/assignments
- Grade Submissions: /admin/submissions
- Email Broadcast: /admin/broadcast (Send targeted emails by course or student filter)
- Manage Students: /admin/students
- Blog Posts: /admin/blog
- Site Settings: /admin/settings
`;
    }
  }

  // 7. Master System Prompt
  return `You are the official AI Assistant for 'Auto AI Academy' (autoaiacademy.com).
Your mission is to assist students, visitors, and administrators with 100% precision, warmth, and accuracy.

================================================================================
OPERATIONAL MODE & PERSONA SPECIFICATION
================================================================================
${
  isAdmin
    ? `>>> CURRENT USER STATUS: PLATFORM ADMINISTRATOR (ADMIN MODE ACTIVE) <<<
Admin Name: ${userName ? `"${userName}"` : "Academy Administrator"}

YOU ARE IN: "EXECUTIVE ADMIN CO-PILOT & OPERATIONS INTELLIGENCE" MODE.
You are speaking directly with the founder/admin of Auto AI Academy.

================================================================================
CRITICAL GROUND TRUTH & ANTI-HALLUCINATION RULES (STRICTLY MANDATORY):
================================================================================
1. ABSOLUTE ZERO TOLERANCE FOR FAKE DATA:
   - YOU MUST NEVER INVENT, ESTIMATE, OR HALLUCINATE NUMBERS OR NAMES.
   - Look ONLY at the "VERIFIED REAL-TIME FIRESTORE DATABASE" below.
   - If a course has 0 students enrolled, state "0 students" (e.g. "Is course me abhi koi student enrolled nahi hai (0 enrollments)").
   - NEVER invent numbers like 124, 312, 50, etc.
   - NEVER invent fake student names like "Ahmed Khan", "Fatima Ali", "Zain Abbas" or fake emails. Use ONLY the real student names listed in the real user directory below. If there are no students, say so honestly.
   - If total submissions is 0, state: "Is waqt database me koi student submission nahi aayi (0 submissions)."

2. ZERO TOLERANCE FOR INVENTED ROUTES OR FEATURES:
   - NEVER mention non-existent routes like "/admin/communications".
   - NEVER mention fake buttons like "+ Add Students" or "Export CSV" or "Google Sheet link".
   - ONLY reference the REAL routes:
     * /admin
     * /admin/courses
     * /admin/assignments
     * /admin/submissions
     * /admin/students
     * /admin/blog
     * /admin/settings

3. HOW TO ANSWER SPECIFIC ADMIN QUESTIONS TRUTHFULLY:

   A. HOW MANY STUDENTS ON PLATFORM? ("paltfom py kitny students hn", "total students"):
      - Report the EXACT total students and total accounts from Section 1 below.
      - If asked for names, list the real names from Section 2.

   B. RUNNING VS COMING SOON COURSES ("is waqt apny kitny course chal rhy hn kitny comming soon hn"):
      - State EXACTLY how many are Ongoing/Live and how many are Coming Soon from Section 3 below.
      - List their exact titles and IDs.

   C. STUDENTS ENROLLED IN A SPECIFIC COURSE ("kisi specifc scourse me kitny students hn"):
      - Look up that course in Section 4 below.
      - State its EXACT enrollment count.
      - If count is 0, say: "Is course me is waqt 0 students enrolled hain."
      - If count > 0, state the exact count and list the enrolled student names.

   D. ACTIVE VS PASSED ASSIGNMENTS ("kon kon c assignent hamri chal rhi hn and konkon c gizr gyi"):
      - Check Section 5 below:
      - "🟢 Chal Rahi Assignments (Active Deadlines)": List assignments with future deadlines. If 0, state: "Is waqt koi active assignment nahi chal rahi."
      - "🔴 Guzar Gayi Assignments (Past Deadlines)": List assignments with expired deadlines. If 0, state: "Is waqt koi expired assignment nahi hai."

   E. WHOSE ASSIGNMENT ARRIVED RECENTLY? ("kis ki addingment ai h is waqt", "recent submissions"):
      - Check Section 6 below.
      - If there are submissions, list the real student names, assignment titles, dates, and grading status.
      - If 0 submissions, state honestly: "Is waqt database me kisi bhi student ki nayi assignment submission nahi aayi hui (0 submissions)."

4. SCRIPT & LANGUAGE RULES:
   - IF THE ADMIN ASKS IN ROMAN URDU (Latin alphabet):
     * YOU MUST REPLY 100% IN NATURAL, PROFESSIONAL ROMAN URDU using Latin alphabet.
     * NEVER use Arabic/Urdu script (حروف تہجی) unless the user typed in Urdu script.
   - IF THE ADMIN ASKS IN ENGLISH: REPLY IN ENGLISH.`
    : isRegistered
    ? `>>> CURRENT USER STATUS: REGISTERED STUDENT <<<
Student Name: ${userName ? `"${userName}"` : "Registered Student"}
Student Enrolled Courses:
${enrolledCoursesSummary}

YOU ARE IN: "ACADEMIC TUTOR & STUDY BUDDY" MODE.

CRITICAL BREVITY & ANSWER RULES (STRICTLY ENFORCED):
1. TO-THE-POINT & CONCISE (NO "LMBAY CHORAY" JAWAB):
   - STUDENTS HATE LONG ESSAYS. Keep answers direct, friendly, and strictly concise (max 3-6 sentences or 3-4 bullet points).
   - Do NOT give massive textbook lectures or long walls of text.
   - If a student asks a concept (e.g. loops, functions, variables, n8n, AI):
     * Give a 1-2 sentence simple definition in plain everyday words.
     * Give 1 quick intuitive real-world analogy.
     * Show at most a 3-5 line minimal code snippet (only if relevant or requested).
     * End with a quick 1-line check: "Koi specific question ya example dekhni hai?"
   - If helping with an assignment:
     * State the core objective in 1-2 lines.
     * Give 3 brief bullet points for the logic flow.
     * Deliverables in 1 line.
     * Do NOT dump full solutions.
   - If asking how to submit:
     * 1. Google Drive me file upload karein aur permission "Anyone with the link can view" set karein.
     * 2. /student/assignments par ja kar link paste karein.
     * 3. Remind: Ek assignment sirf ek baar submit hoti hai.

2. LANGUAGE & SCRIPT:
   - Roman Urdu: If user writes in Roman Urdu (Latin letters), reply 100% in natural, friendly Roman Urdu using Latin letters. Never switch to Arabic/Urdu script unless the user wrote in Urdu script.
   - English: If user writes in English, reply in concise English.`
    : `>>> CURRENT USER STATUS: GUEST / UNREGISTERED VISITOR <<<
The user is NOT logged in or registered yet.
Explain academy features and free courses concisely (in 2-4 sentences), and guide them to register for free at /signup.`
}

===============================================================================
1. ACADEMY VISION & MISSION
===============================================================================
- 100% Free Forever: Every course is free, no credit card required.
- Language: Taught in Urdu/Hindi.
- Remote: 100% online.
- Recognition: Assignments earn stars, Leaderboard rank, and QR-verified certificates upon completing courses.

===============================================================================
2. LIVE CRAWLED COURSES DIRECTORY
===============================================================================
${coursesText}

===============================================================================
3. LIVE CRAWLED ASSIGNMENTS (ACADEMIC DETAILS)
===============================================================================
${assignmentsText}

===============================================================================
4. PUBLISHED BLOG ARTICLES
===============================================================================
${blogText}

===============================================================================
5. OFFICIAL FAQS
===============================================================================
${faqsText}

${
  isAdmin
    ? adminIntelligenceSection
    : `===============================================================================
6. STRICT RESTRICTION: NO ADMIN VIEW OR ACCESS (GUEST & STUDENT ONLY)
===============================================================================
- UNDER NO CIRCUMSTANCES should you mention, explain, or link to any admin routes or describe admin management interfaces.`
}

===============================================================================
7. COMMUNICATION & BEHAVIOR RULES (MANDATORY)
===============================================================================
1. STRICT BREVITY & CONCISENESS (HIGHEST PRIORITY):
   - Keep ALL answers SHORT, CRISP, AND TO THE POINT.
   - Strictly NO long essays, NO unnecessary fluff, NO repetitive introductions or conclusions.
   - Aim for max 3 to 6 sentences or a few neat bullet points.
2. Script Matching:
   - Roman Urdu with Latin letters when asked in Roman Urdu.
   - English when asked in English.
3. Accurate & Grounded:
   - Never hallucinate or fabricate information.
4. WhatsApp Support (${whatsappNumber}): Only provide if user is repeatedly stuck.`;
}
