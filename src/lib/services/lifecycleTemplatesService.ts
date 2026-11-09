import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface LifecycleTemplateDefinition {
  id: string;
  title: string;
  defaultSubject: string;
  defaultBody: string;
  placeholders: Array<{ key: string; description: string; sample: string }>;
  categoryBadge: string;
  ctaText: string;
  ctaUrlPattern: string;
}

export const LIFECYCLE_TEMPLATES_DEFINITIONS: Record<string, LifecycleTemplateDefinition> = {
  enrollment_welcome: {
    id: "enrollment_welcome",
    title: "Course Enrollment Welcome",
    defaultSubject: "Welcome to {{courseTitle}} — Getting Started",
    defaultBody: `<p>Welcome to <strong>{{courseTitle}}</strong> on Auto AI Academy! We are pleased to confirm your enrollment in this cohort.</p>
<p>Here are key guidelines to make the most of your learning journey:</p>
<ul style="margin: 0 0 16px 20px; line-height: 1.8; color: #334155;">
  <li><strong>Structured Video Lectures:</strong> Available directly on your Student Portal and YouTube playlist.</li>
  <li><strong>Practical Assignments:</strong> Submit your project code or files on time to collect stars (★) and climb the global Leaderboard.</li>
  <li><strong>24/7 AI Study Tutor:</strong> If you ever encounter a bug or concept question, access your AI Study Tutor from your dashboard anytime.</li>
  <li><strong>Verified Certificate:</strong> Submit at least 80% of all assignments to earn your official, QR-verified credential upon completion.</li>
</ul>
<p>You can now open your portal and begin Lesson 1 at your own pace.</p>`,
    placeholders: [
      { key: "studentName", description: "Student's full name", sample: "Muhammad Ali" },
      { key: "courseTitle", description: "Title of the enrolled course", sample: "n8n Workflow Automation" },
    ],
    categoryBadge: "Course Welcome",
    ctaText: "Go to Course Portal",
    ctaUrlPattern: "/student/courses",
  },
  inactive_48h: {
    id: "inactive_48h",
    title: "48-Hour Inactive Signup Re-engagement",
    defaultSubject: "Continue Your Learning: Explore Available Courses",
    defaultBody: `<p>We noticed you recently created your student account on Auto AI Academy, but haven't enrolled in a course yet.</p>
<p>Our practical curriculum is designed to help you build real-world AI and programming skills:</p>
<ul style="margin: 0 0 16px 20px; line-height: 1.8; color: #334155;">
  <li><strong>Python Programming:</strong> Master fundamentals, algorithms, and real automation scripts.</li>
  <li><strong>n8n & AI Automations:</strong> Build intelligent workflows, webhooks, and customer support agents.</li>
</ul>
<p>Enrollment is 1-click and immediately gives you access to assignment briefs, the AI Tutor, and verified certificates.</p>
<p>Explore our active catalog below and choose the path that matches your career goals.</p>`,
    placeholders: [
      { key: "studentName", description: "Student's full name", sample: "Sarah Khan" },
    ],
    categoryBadge: "Learning Orientation",
    ctaText: "Browse Course Catalog",
    ctaUrlPattern: "/courses",
  },
  missed_deadline: {
    id: "missed_deadline",
    title: "Missed Deadline Follow-up & Motivation",
    defaultSubject: "Course Update: \"{{assignmentTitle}}\" in {{courseTitle}}",
    defaultBody: `<p>We noted that the primary deadline for <strong>"{{assignmentTitle}}"</strong> in <em>{{courseTitle}}</em> has elapsed without a registered submission.</p>
<p>In technical education, consistent learning matters far more than a single milestone. Keep working through your lessons and preparing for upcoming modules.</p>
<p>Upon course completion, late submission catch-up windows become available to help you reach the 80% mark required for graduation.</p>`,
    placeholders: [
      { key: "studentName", description: "Student's full name", sample: "Ahmed Raza" },
      { key: "courseTitle", description: "Course title", sample: "Python for Automation" },
      { key: "assignmentTitle", description: "Assignment title", sample: "CSV Data Pipeline" },
    ],
    categoryBadge: "Academic Update",
    ctaText: "Continue Course Lessons",
    ctaUrlPattern: "/student/courses",
  },
  new_assignment: {
    id: "new_assignment",
    title: "New Course Assignment Published",
    defaultSubject: "New Assignment Posted: \"{{assignmentTitle}}\" ({{courseTitle}})",
    defaultBody: `<p>A new practical assignment has been published for your enrolled course <strong>{{courseTitle}}</strong>.</p>
<div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
  <p style="margin: 0 0 6px 0; font-weight: 700; color: #0f172a; font-size: 15px;">{{assignmentTitle}}</p>
  <p style="margin: 0 0 6px 0; font-size: 13px; color: #64748b;"><strong>Submission Deadline:</strong> {{dueDateFormatted}}</p>
  <p style="margin: 0; font-size: 14px; color: #334155;">{{description}}</p>
</div>
<p>Submitting on time ensures full timeliness marks and strengthens your standing on the Leaderboard.</p>
<p>If you need guidance or code hints, open your <strong>AI Study Tutor</strong> anytime on the portal.</p>`,
    placeholders: [
      { key: "studentName", description: "Student's full name", sample: "Hamza Tariq" },
      { key: "courseTitle", description: "Course title", sample: "n8n Automation Mastery" },
      { key: "assignmentTitle", description: "Assignment title", sample: "Building Lead Scraper" },
      { key: "dueDateFormatted", description: "Formatted deadline date", sample: "Sunday, Nov 15, 2026, 11:59 PM" },
      { key: "description", description: "Assignment task brief", sample: "Build an automated scraper webhook." },
    ],
    categoryBadge: "New Assignment",
    ctaText: "View Assignment Brief",
    ctaUrlPattern: "/student/assignments",
  },
  reminder_24h: {
    id: "reminder_24h",
    title: "24-Hour Assignment Deadline Reminder",
    defaultSubject: "Reminder: 24 Hours Remaining for \"{{assignmentTitle}}\"",
    defaultBody: `<p>This is a notification that the deadline for <strong>"{{assignmentTitle}}"</strong> in <em>{{courseTitle}}</em> is in less than 24 hours.</p>
<div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
  <p style="margin: 0 0 4px 0; font-weight: 700; color: #92400e; font-size: 15px;">Due Date: {{dueDateFormatted}}</p>
  <p style="margin: 0; font-size: 13px; color: #b45309;">Ensure your Google Drive or GitHub link is shared with public view permissions before submitting.</p>
</div>
<p>Submitting before the deadline awards full timeliness points and helps maintain your leaderboard rank.</p>`,
    placeholders: [
      { key: "studentName", description: "Student's full name", sample: "Zainab Bibi" },
      { key: "courseTitle", description: "Course title", sample: "AI Agent Development" },
      { key: "assignmentTitle", description: "Assignment title", sample: "Customer Support Bot" },
      { key: "dueDateFormatted", description: "Formatted deadline date", sample: "Tomorrow at 11:59 PM" },
    ],
    categoryBadge: "Deadline Alert",
    ctaText: "Submit Assignment Now",
    ctaUrlPattern: "/student/assignments",
  },
  submission_received: {
    id: "submission_received",
    title: "Submission Received Confirmation",
    defaultSubject: "Submission Confirmation: \"{{assignmentTitle}}\"",
    defaultBody: `<p>Thank you for submitting your work for <strong>"{{assignmentTitle}}"</strong>.</p>
<p>Your submission has been securely logged and placed in the faculty grading queue.</p>
<div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
  <p style="margin: 0 0 4px 0; font-weight: 700; color: #0f172a; font-size: 14px;">Evaluation Criteria:</p>
  <ul style="margin: 0 0 0 16px; font-size: 13px; color: #475569; line-height: 1.6;">
    <li>Correctness & Code Functionality</li>
    <li>Creativity & Technical Cleanliness</li>
    <li>Submission Timeliness</li>
  </ul>
</div>
<p>Once graded, your stars and feedback will be published directly to your Student Dashboard.</p>`,
    placeholders: [
      { key: "studentName", description: "Student's full name", sample: "Bilal Asif" },
      { key: "assignmentTitle", description: "Assignment title", sample: "WhatsApp Bot Integration" },
    ],
    categoryBadge: "Submission Received",
    ctaText: "View Student Portal",
    ctaUrlPattern: "/student",
  },
  submission_graded: {
    id: "submission_graded",
    title: "Assignment Graded & Stars Breakdown",
    defaultSubject: "Grade Released: \"{{assignmentTitle}}\" ({{finalStars}}/5.0 Stars)",
    defaultBody: `<p>Your submission for <strong>"{{assignmentTitle}}"</strong> has been reviewed and officially graded by the instruction team.</p>
<div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px 20px; border-radius: 8px; margin: 16px 0;">
  <p style="margin: 0 0 10px 0; font-size: 17px; font-weight: 800; color: #15803d;">
    Final Score: {{finalStars}} / 5.0 Stars (★)
  </p>
  <div style="font-size: 13px; color: #166534; line-height: 1.6;">
    • Correctness: <strong>{{correctness}} ★</strong><br/>
    • Creativity: <strong>{{creativity}} ★</strong><br/>
    • Timeliness: <strong>{{timeliness}} ★</strong>
  </div>
</div>
<p>Your stars have been credited to your student profile and updated on the global Leaderboard.</p>`,
    placeholders: [
      { key: "studentName", description: "Student's full name", sample: "Usman Ghani" },
      { key: "assignmentTitle", description: "Assignment title", sample: "FastAPI REST Service" },
      { key: "finalStars", description: "Final stars earned (0 to 5)", sample: "4.8" },
      { key: "correctness", description: "Correctness score", sample: "5.0" },
      { key: "creativity", description: "Creativity score", sample: "4.5" },
      { key: "timeliness", description: "Timeliness score", sample: "5.0" },
    ],
    categoryBadge: "Assignment Grade",
    ctaText: "View Detailed Feedback",
    ctaUrlPattern: "/student/assignments",
  },
  leaderboard_rank: {
    id: "leaderboard_rank",
    title: "Top 10 Leaderboard Rank Celebration",
    defaultSubject: "Leaderboard Achievement: Rank #{{rank}} Milestone",
    defaultBody: `<p>Congratulations! Your recent assignment scores have positioned you in the <strong>Top 10</strong> across all active students at Auto AI Academy.</p>
<div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 16px 20px; border-radius: 8px; margin: 16px 0;">
  <p style="margin: 0; font-size: 17px; font-weight: 800; color: #854d0e;">
    Academy Rank: #{{rank}} &bull; Total Stars: {{totalStars}} ★
  </p>
</div>
<p>Your dedication serves as an inspiration to the community. Maintain your momentum in upcoming modules to preserve your podium standing.</p>`,
    placeholders: [
      { key: "studentName", description: "Student's full name", sample: "Fatima Noor" },
      { key: "rank", description: "Current rank number", sample: "3" },
      { key: "totalStars", description: "Total all-time stars", sample: "24.5" },
    ],
    categoryBadge: "Leaderboard Digest",
    ctaText: "View Live Leaderboard",
    ctaUrlPattern: "/leaderboard",
  },
  catchup_80_percent_reached: {
    id: "catchup_80_percent_reached",
    title: "Catch-up 80% Reached — Certificate Unlocked",
    defaultSubject: "80% Milestone Achieved: Certificate Unlocked for {{courseTitle}}",
    defaultBody: `<p>Congratulations! With your recent submissions, you have reached <strong>80% assignment completion</strong> in <strong>{{courseTitle}}</strong>.</p>
<div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 16px 20px; border-radius: 8px; margin: 16px 0;">
  <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 800; color: #065f46;">
    Graduation Verified
  </p>
  <p style="margin: 0; font-size: 14px; color: #047857;">
    Your perseverance has earned you your official credential.
  </p>
</div>
<p>Visit your portal to claim your QR-verified certificate.</p>`,
    placeholders: [
      { key: "studentName", description: "Student's full name", sample: "Hassan Javed" },
      { key: "courseTitle", description: "Course title", sample: "n8n Automation Mastery" },
    ],
    categoryBadge: "Milestone Reached",
    ctaText: "View Certificate",
    ctaUrlPattern: "/student/certificates",
  },
  course_completed_eligible: {
    id: "course_completed_eligible",
    title: "Course Completed: 80%+ Certificate Eligible",
    defaultSubject: "Certificate Eligibility Confirmed: {{courseTitle}}",
    defaultBody: `<p>Congratulations! The course <strong>"{{courseTitle}}"</strong> has concluded, and you have achieved a <strong>{{submissionPercentage}}%</strong> assignment submission rate (satisfying the &ge;80% graduation requirement).</p>
<div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 16px 20px; border-radius: 8px; margin: 16px 0;">
  <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 800; color: #065f46;">
    Verified Certificate Ready
  </p>
  <p style="margin: 0; font-size: 14px; color: #047857;">
    Both graduation criteria have been met: formal cohort completion and verified assignment submissions.
  </p>
</div>
<p>You can now generate and verify your credential from your Student Portal under <strong>Certificates</strong>.</p>`,
    placeholders: [
      { key: "studentName", description: "Student's full name", sample: "Ayesha Malik" },
      { key: "courseTitle", description: "Course title", sample: "AI Customer Support Bot" },
      { key: "submissionPercentage", description: "Completed submission percentage", sample: "90" },
    ],
    categoryBadge: "Certificate Ready",
    ctaText: "Claim Your Certificate",
    ctaUrlPattern: "/student/certificates",
  },
  course_completed_catchup: {
    id: "course_completed_catchup",
    title: "Course Completed: Catch-up Window Open (<80%)",
    defaultSubject: "Catch-up Opportunity: Complete Your {{courseTitle}} Certificate",
    defaultBody: `<p>The primary cohort for <strong>"{{courseTitle}}"</strong> has finished. Your current assignment completion is <strong>{{submissionPercentage}}%</strong> (80% is needed to graduate).</p>
<div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 8px; margin: 16px 0;">
  <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: #1e40af;">
    Previous Assignments Remain Open
  </p>
  <p style="margin: 0; font-size: 13px; color: #1d4ed8;">
    To ensure every committed student has the opportunity to earn their certificate, previously missed assignments remain accessible on your dashboard.
  </p>
</div>
<p>Once your submitted assignments reach the 80% threshold, your verified certificate will unlock automatically.</p>`,
    placeholders: [
      { key: "studentName", description: "Student's full name", sample: "Omer Saeed" },
      { key: "courseTitle", description: "Course title", sample: "Python Automations" },
      { key: "submissionPercentage", description: "Completed submission percentage", sample: "60" },
    ],
    categoryBadge: "Catch-up Notice",
    ctaText: "Complete Open Assignments",
    ctaUrlPattern: "/student/assignments",
  },
  new_course_published: {
    id: "new_course_published",
    title: "New Course Published Announcement",
    defaultSubject: "New Course Released: \"{{courseTitle}}\"",
    defaultBody: `<p>We are pleased to introduce a brand new course on Auto AI Academy: <strong>{{courseTitle}}</strong>.</p>
<div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
  <p style="margin: 0 0 6px 0; font-weight: 700; color: #0f172a; font-size: 15px;">{{courseTitle}}</p>
  <p style="margin: 0 0 6px 0; font-size: 13px; color: #64748b;">
    Level: <strong>{{level}}</strong> &bull; Schedule: <strong>{{duration}}</strong>
  </p>
  <p style="margin: 0; font-size: 14px; color: #334155;">{{description}}</p>
</div>
<p>Enrollment is accessible directly from your Student Portal.</p>`,
    placeholders: [
      { key: "studentName", description: "Student's full name", sample: "Danish Ali" },
      { key: "courseTitle", description: "Course title", sample: "Agentic AI Engineering" },
      { key: "level", description: "Course level (Beginner/Intermediate/Advanced)", sample: "Intermediate" },
      { key: "duration", description: "Duration or module length", sample: "4 Weeks (Hands-on)" },
      { key: "description", description: "Course description summary", sample: "Build autonomous multi-agent pipelines." },
    ],
    categoryBadge: "New Course",
    ctaText: "Enroll in Course",
    ctaUrlPattern: "/courses",
  },
  course_status_ongoing: {
    id: "course_status_ongoing",
    title: "Course Status Changed to Ongoing (Enrollment Open)",
    defaultSubject: "Course Now Live: \"{{courseTitle}}\"",
    defaultBody: `<p>We are pleased to notify you that <strong>"{{courseTitle}}"</strong> is now officially <strong>Live & Ongoing</strong> on Auto AI Academy.</p>
<p>Course lectures, syllabus outlines, and initial assignment briefs are now active on the portal.</p>
<p>Access your dashboard to confirm your enrollment and review the introductory lecture.</p>`,
    placeholders: [
      { key: "studentName", description: "Student's full name", sample: "Rehan Siddiqui" },
      { key: "courseTitle", description: "Course title", sample: "WhatsApp Automation Bot" },
    ],
    categoryBadge: "Course Live",
    ctaText: "Open Course Dashboard",
    ctaUrlPattern: "/student/courses",
  },
};

export interface CustomLifecycleTemplate {
  subject: string;
  body: string;
  updatedAt?: any;
}

// In-memory cache for fast lookups on server/client
let templatesCache: Record<string, CustomLifecycleTemplate> | null = null;
let lastCacheFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

function lifecycleSettingsDoc() {
  return doc(db, "admin_settings", "lifecycle_templates");
}

/**
 * Fetches all customized lifecycle templates from Firestore (with 1-minute memory cache).
 */
export async function fetchCustomLifecycleTemplates(forceRefresh = false): Promise<Record<string, CustomLifecycleTemplate>> {
  const now = Date.now();
  if (!forceRefresh && templatesCache && now - lastCacheFetchTime < CACHE_TTL_MS) {
    return templatesCache;
  }

  try {
    const snap = await getDoc(lifecycleSettingsDoc());
    if (snap.exists()) {
      templatesCache = (snap.data() as Record<string, CustomLifecycleTemplate>) || {};
    } else {
      templatesCache = {};
    }
    lastCacheFetchTime = now;
    return templatesCache;
  } catch (err) {
    console.warn("Could not fetch custom lifecycle templates from Firestore, using defaults:", err);
    return templatesCache || {};
  }
}

/**
 * Saves or updates a custom lifecycle email template in Firestore.
 */
export async function saveCustomLifecycleTemplate(
  flowId: string,
  template: { subject: string; body: string }
): Promise<void> {
  const cleanSubject = template.subject.trim();
  const cleanBody = template.body.trim();

  await setDoc(
    lifecycleSettingsDoc(),
    {
      [flowId]: {
        subject: cleanSubject,
        body: cleanBody,
        updatedAt: serverTimestamp(),
      },
    },
    { merge: true }
  );

  // Invalidate cache
  if (templatesCache) {
    templatesCache[flowId] = { subject: cleanSubject, body: cleanBody, updatedAt: new Date() };
  }
}

/**
 * Resets a custom lifecycle email template back to its default copy.
 */
export async function resetCustomLifecycleTemplate(flowId: string): Promise<void> {
  const custom = await fetchCustomLifecycleTemplates(true);
  delete custom[flowId];

  await setDoc(lifecycleSettingsDoc(), custom);
  templatesCache = custom;
}

/**
 * Replaces placeholders like {{key}} with actual values in a text string.
 */
export function interpolateVariables(templateText: string, variables: Record<string, string | number>): string {
  if (!templateText) return "";
  return templateText.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (match, key) => {
    if (key in variables && variables[key] !== undefined && variables[key] !== null) {
      return String(variables[key]);
    }
    return match;
  });
}

/**
 * Resolves the final subject and HTML body for a lifecycle email flow:
 * Uses custom template if configured by admin, otherwise falls back to default.
 */
export async function resolveLifecycleContent(
  flowId: string,
  variables: Record<string, string | number>,
  fallbackSubject: string,
  fallbackBody: string
): Promise<{ subject: string; bodyContent: string }> {
  try {
    const customTemplates = await fetchCustomLifecycleTemplates();
    const custom = customTemplates[flowId];

    if (custom && custom.subject && custom.body) {
      const subject = interpolateVariables(custom.subject, variables);
      const bodyContent = interpolateVariables(custom.body, variables);
      return { subject, bodyContent };
    }
  } catch (err) {
    console.warn(`Could not resolve custom template for ${flowId}, using default:`, err);
  }

  // Fallback to default copy
  const subject = interpolateVariables(fallbackSubject, variables);
  const bodyContent = interpolateVariables(fallbackBody, variables);
  return { subject, bodyContent };
}

