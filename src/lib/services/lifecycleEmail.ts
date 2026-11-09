import { createSmtpTransporter, resolveSmtpConfig } from "@/lib/services/mailer";
import { buildEmailTemplate, htmlToPlainText } from "@/lib/services/emailTemplates";
import {
  resolveLifecycleContent,
  LIFECYCLE_TEMPLATES_DEFINITIONS,
} from "./lifecycleTemplatesService";
import { SITE_NAME } from "@/lib/constants";
import { SITE_URL } from "@/lib/seo";

/**
 * Robust, high-deliverability lifecycle email dispatcher.
 * Engineered to avoid spam filters and ensure beautiful mobile/desktop readability.
 */

// Helper to send email safely, generate plain-text fallback, and log delivery history
async function safeSendMail({
  to,
  recipientName = "Student",
  subject,
  html,
  category = "automation",
  campaignLabel = "Automated Lifecycle",
  courseTitle,
  assignmentTitle,
}: {
  to: string;
  recipientName?: string;
  subject: string;
  html: string;
  category?: string;
  campaignLabel?: string;
  courseTitle?: string;
  assignmentTitle?: string;
}): Promise<boolean> {
  let success = false;
  let errorMsg: string | undefined;

  try {
    const config = await resolveSmtpConfig();
    if (!config.user || !config.pass) {
      console.warn("SMTP not configured. Skipping lifecycle email to:", to);
      return false;
    }

    const transporter = createSmtpTransporter(config);
    const textFallback = htmlToPlainText(html);
    const cleanSubject = subject.replace(/^\[.*?\]\s*/, "").trim();

    await transporter.sendMail({
      from: `"${config.fromName || SITE_NAME}" <${config.fromEmail || config.user}>`,
      to: `"${recipientName}" <${to}>`,
      subject: cleanSubject,
      text: textFallback,
      html,
      headers: {
        "X-Entity-Ref-ID": `lifecycle-${Date.now()}-${category}`,
        "List-Unsubscribe": `<mailto:${config.fromEmail || config.user}?subject=Unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        "X-Mailer": "Auto AI Academy Notification Engine",
        "X-Priority": "3",
      },
    });
    success = true;
  } catch (err: any) {
    console.error(`Failed to send lifecycle email to ${to}:`, err.message);
    errorMsg = err.message;
  }

  // Record delivery history in Firestore
  try {
    const { recordEmailDelivery } = await import("@/lib/services/emailLogs");
    await recordEmailDelivery({
      category,
      campaignLabel,
      recipientEmail: to,
      recipientName,
      subject,
      previewSnippet: subject,
      bodyContent: html,
      courseTitle,
      assignmentTitle,
      status: success ? "delivered" : "failed",
      error: errorMsg,
    });
  } catch (logErr) {
    console.warn("Could not record delivery log:", logErr);
  }

  return success;
}

// -----------------------------------------------------------------------------
// 1. Course Enrollment Welcome Email
// -----------------------------------------------------------------------------
export async function sendEnrollmentWelcomeEmail({
  studentEmail,
  studentName,
  courseTitle,
  courseId,
  youtubeUrl,
}: {
  studentEmail: string;
  studentName: string;
  courseTitle: string;
  courseId: string;
  youtubeUrl?: string;
}) {
  const def = LIFECYCLE_TEMPLATES_DEFINITIONS.enrollment_welcome;
  const { subject, bodyContent } = await resolveLifecycleContent(
    "enrollment_welcome",
    { studentName, courseTitle, youtubeUrl: youtubeUrl || "" },
    def.defaultSubject,
    def.defaultBody
  );

  const html = buildEmailTemplate({
    subject,
    studentName,
    bodyContent,
    categoryBadge: "Course Welcome",
    ctaText: "Go to Course Portal",
    ctaUrl: `${SITE_URL}/student/courses`,
    siteUrl: SITE_URL,
  });

  return safeSendMail({
    to: studentEmail,
    recipientName: studentName,
    subject,
    html,
    category: "enrollment_welcome",
    campaignLabel: "Course Welcome",
    courseTitle,
  });
}

// -----------------------------------------------------------------------------
// 2. Inactive Student (Account Created >= 48h but No Course Enrollments)
// -----------------------------------------------------------------------------
export async function sendInactiveSignupEmail({
  studentEmail,
  studentName,
}: {
  studentEmail: string;
  studentName: string;
}) {
  const def = LIFECYCLE_TEMPLATES_DEFINITIONS.inactive_48h;
  const { subject, bodyContent } = await resolveLifecycleContent(
    "inactive_48h",
    { studentName },
    def.defaultSubject,
    def.defaultBody
  );

  const html = buildEmailTemplate({
    subject,
    studentName,
    bodyContent,
    categoryBadge: "Learning Orientation",
    ctaText: "Browse Course Catalog",
    ctaUrl: `${SITE_URL}/courses`,
    siteUrl: SITE_URL,
  });

  return safeSendMail({
    to: studentEmail,
    recipientName: studentName,
    subject,
    html,
    category: "inactive_48h",
    campaignLabel: "48h Inactive Reminder",
  });
}

// -----------------------------------------------------------------------------
// 3. New Assignment Announcement Email
// -----------------------------------------------------------------------------
export async function sendNewAssignmentEmail({
  studentEmail,
  studentName,
  courseTitle,
  assignmentTitle,
  description,
  dueDateFormatted,
}: {
  studentEmail: string;
  studentName: string;
  courseTitle: string;
  assignmentTitle: string;
  description: string;
  dueDateFormatted: string;
}) {
  const def = LIFECYCLE_TEMPLATES_DEFINITIONS.new_assignment;
  const { subject, bodyContent } = await resolveLifecycleContent(
    "new_assignment",
    { studentName, courseTitle, assignmentTitle, description, dueDateFormatted },
    def.defaultSubject,
    def.defaultBody
  );

  const html = buildEmailTemplate({
    subject,
    studentName,
    bodyContent,
    categoryBadge: "New Assignment",
    ctaText: "View Assignment Brief",
    ctaUrl: `${SITE_URL}/student/assignments`,
    siteUrl: SITE_URL,
  });

  return safeSendMail({
    to: studentEmail,
    recipientName: studentName,
    subject,
    html,
    category: "new_assignment",
    campaignLabel: "New Assignment Alert",
    courseTitle,
    assignmentTitle,
  });
}

// -----------------------------------------------------------------------------
// 4. Assignment Deadline Reminder (24 Hours Remaining)
// -----------------------------------------------------------------------------
export async function sendAssignmentDeadlineReminderEmail({
  studentEmail,
  studentName,
  courseTitle,
  assignmentTitle,
  dueDateFormatted,
}: {
  studentEmail: string;
  studentName: string;
  courseTitle: string;
  assignmentTitle: string;
  dueDateFormatted: string;
}) {
  const def = LIFECYCLE_TEMPLATES_DEFINITIONS.reminder_24h;
  const { subject, bodyContent } = await resolveLifecycleContent(
    "reminder_24h",
    { studentName, courseTitle, assignmentTitle, dueDateFormatted },
    def.defaultSubject,
    def.defaultBody
  );

  const html = buildEmailTemplate({
    subject,
    studentName,
    bodyContent,
    categoryBadge: "Deadline Alert",
    ctaText: "Submit Assignment Now",
    ctaUrl: `${SITE_URL}/student/assignments`,
    siteUrl: SITE_URL,
  });

  return safeSendMail({
    to: studentEmail,
    recipientName: studentName,
    subject,
    html,
    category: "deadline_24h",
    campaignLabel: "24h Deadline Alert",
    courseTitle,
    assignmentTitle,
  });
}

// -----------------------------------------------------------------------------
// 5. Assignment Submission Received Confirmation
// -----------------------------------------------------------------------------
export async function sendSubmissionReceivedEmail({
  studentEmail,
  studentName,
  assignmentTitle,
}: {
  studentEmail: string;
  studentName: string;
  assignmentTitle: string;
}) {
  const def = LIFECYCLE_TEMPLATES_DEFINITIONS.submission_received;
  const { subject, bodyContent } = await resolveLifecycleContent(
    "submission_received",
    { studentName, assignmentTitle },
    def.defaultSubject,
    def.defaultBody
  );

  const html = buildEmailTemplate({
    subject,
    studentName,
    bodyContent,
    categoryBadge: "Submission Received",
    ctaText: "View Student Portal",
    ctaUrl: `${SITE_URL}/student`,
    siteUrl: SITE_URL,
  });

  return safeSendMail({
    to: studentEmail,
    recipientName: studentName,
    subject,
    html,
    category: "submission_receipt",
    campaignLabel: "Submission Receipt",
    assignmentTitle,
  });
}

// -----------------------------------------------------------------------------
// 6. Missed Assignment Deadline Follow-up
// -----------------------------------------------------------------------------
export async function sendMissedDeadlineEmail({
  studentEmail,
  studentName,
  courseTitle,
  assignmentTitle,
}: {
  studentEmail: string;
  studentName: string;
  courseTitle: string;
  assignmentTitle: string;
}) {
  const def = LIFECYCLE_TEMPLATES_DEFINITIONS.missed_deadline;
  const { subject, bodyContent } = await resolveLifecycleContent(
    "missed_deadline",
    { studentName, courseTitle, assignmentTitle },
    def.defaultSubject,
    def.defaultBody
  );

  const html = buildEmailTemplate({
    subject,
    studentName,
    bodyContent,
    categoryBadge: "Academic Update",
    ctaText: "Continue Course Lessons",
    ctaUrl: `${SITE_URL}/student/courses`,
    siteUrl: SITE_URL,
  });

  return safeSendMail({
    to: studentEmail,
    recipientName: studentName,
    subject,
    html,
    category: "missed_deadline",
    campaignLabel: "Missed Deadline Follow-up",
    courseTitle,
    assignmentTitle,
  });
}

// -----------------------------------------------------------------------------
// 7. Assignment Graded / Result Notification
// -----------------------------------------------------------------------------
export async function sendSubmissionGradedEmail({
  studentEmail,
  studentName,
  assignmentTitle,
  finalStars,
  correctness,
  creativity,
  timeliness,
}: {
  studentEmail: string;
  studentName: string;
  assignmentTitle: string;
  finalStars: number;
  correctness: number;
  creativity: number;
  timeliness: number;
}) {
  const def = LIFECYCLE_TEMPLATES_DEFINITIONS.submission_graded;
  const { subject, bodyContent } = await resolveLifecycleContent(
    "submission_graded",
    {
      studentName,
      assignmentTitle,
      finalStars: finalStars.toFixed(1),
      correctness: correctness.toFixed(1),
      creativity: creativity.toFixed(1),
      timeliness: timeliness.toFixed(1),
    },
    def.defaultSubject,
    def.defaultBody
  );

  const html = buildEmailTemplate({
    subject,
    studentName,
    bodyContent,
    categoryBadge: "Assignment Grade",
    ctaText: "View Detailed Feedback",
    ctaUrl: `${SITE_URL}/student/assignments`,
    siteUrl: SITE_URL,
  });

  return safeSendMail({
    to: studentEmail,
    recipientName: studentName,
    subject,
    html,
    category: "submission_graded",
    campaignLabel: "Graded & Stars Notification",
    assignmentTitle,
  });
}

// -----------------------------------------------------------------------------
// 8. Leaderboard Position Update (Top 10 vs General)
// -----------------------------------------------------------------------------
export async function sendLeaderboardRankEmail({
  studentEmail,
  studentName,
  rank,
  totalStars,
}: {
  studentEmail: string;
  studentName: string;
  rank: number;
  totalStars: number;
}) {
  const def = LIFECYCLE_TEMPLATES_DEFINITIONS.leaderboard_rank;
  const { subject, bodyContent } = await resolveLifecycleContent(
    "leaderboard_rank",
    {
      studentName,
      rank,
      totalStars: totalStars.toFixed(1),
    },
    def.defaultSubject,
    def.defaultBody
  );

  const html = buildEmailTemplate({
    subject,
    studentName,
    bodyContent,
    categoryBadge: "Leaderboard Digest",
    ctaText: "View Live Leaderboard",
    ctaUrl: `${SITE_URL}/leaderboard`,
    siteUrl: SITE_URL,
  });

  return safeSendMail({
    to: studentEmail,
    recipientName: studentName,
    subject,
    html,
    category: "leaderboard_rank",
    campaignLabel: "Leaderboard Update",
  });
}

// -----------------------------------------------------------------------------
// 9. Course Marked Completed: Certificate Eligible (>= 80% Submissions)
// -----------------------------------------------------------------------------
export async function sendCourseCompletedEligibleEmail({
  studentEmail,
  studentName,
  courseTitle,
  courseId,
  submissionPercentage,
}: {
  studentEmail: string;
  studentName: string;
  courseTitle: string;
  courseId: string;
  submissionPercentage: number;
}) {
  const def = LIFECYCLE_TEMPLATES_DEFINITIONS.course_completed_eligible;
  const { subject, bodyContent } = await resolveLifecycleContent(
    "course_completed_eligible",
    {
      studentName,
      courseTitle,
      submissionPercentage: Math.round(submissionPercentage),
    },
    def.defaultSubject,
    def.defaultBody
  );

  const html = buildEmailTemplate({
    subject,
    studentName,
    bodyContent,
    categoryBadge: "Certificate Ready",
    ctaText: "Claim Your Certificate",
    ctaUrl: `${SITE_URL}/student/certificates`,
    siteUrl: SITE_URL,
  });

  return safeSendMail({
    to: studentEmail,
    recipientName: studentName,
    subject,
    html,
    category: "course_completed_eligible",
    campaignLabel: "Course Completed (Eligible)",
    courseTitle,
  });
}

// -----------------------------------------------------------------------------
// 10. Course Marked Completed: Catch-up Needed (< 80% Submissions)
// -----------------------------------------------------------------------------
export async function sendCourseCompletedCatchUpEmail({
  studentEmail,
  studentName,
  courseTitle,
  courseId,
  submissionPercentage,
}: {
  studentEmail: string;
  studentName: string;
  courseTitle: string;
  courseId: string;
  submissionPercentage: number;
}) {
  const def = LIFECYCLE_TEMPLATES_DEFINITIONS.course_completed_catchup;
  const { subject, bodyContent } = await resolveLifecycleContent(
    "course_completed_catchup",
    {
      studentName,
      courseTitle,
      submissionPercentage: Math.round(submissionPercentage),
    },
    def.defaultSubject,
    def.defaultBody
  );

  const html = buildEmailTemplate({
    subject,
    studentName,
    bodyContent,
    categoryBadge: "Catch-up Notice",
    ctaText: "Complete Open Assignments",
    ctaUrl: `${SITE_URL}/student/assignments`,
    siteUrl: SITE_URL,
  });

  return safeSendMail({
    to: studentEmail,
    recipientName: studentName,
    subject,
    html,
    category: "course_completed_catch_up",
    campaignLabel: "Catch-up Needed",
    courseTitle,
  });
}

// -----------------------------------------------------------------------------
// 11. Catch-Up 80% Milestone Reached (After Late Submissions in Completed Course)
// -----------------------------------------------------------------------------
export async function sendCatchUp80PercentReachedEmail({
  studentEmail,
  studentName,
  courseTitle,
}: {
  studentEmail: string;
  studentName: string;
  courseTitle: string;
}) {
  const def = LIFECYCLE_TEMPLATES_DEFINITIONS.catchup_80_percent_reached;
  const { subject, bodyContent } = await resolveLifecycleContent(
    "catchup_80_percent_reached",
    { studentName, courseTitle },
    def.defaultSubject,
    def.defaultBody
  );

  const html = buildEmailTemplate({
    subject,
    studentName,
    bodyContent,
    categoryBadge: "Milestone Reached",
    ctaText: "View Certificate",
    ctaUrl: `${SITE_URL}/student/certificates`,
    siteUrl: SITE_URL,
  });

  return safeSendMail({
    to: studentEmail,
    recipientName: studentName,
    subject,
    html,
    category: "catch_up_80_reached",
    campaignLabel: "80% Catch-up Milestone",
    courseTitle,
  });
}

// -----------------------------------------------------------------------------
// 12. New Course Published (All Registered Students)
// -----------------------------------------------------------------------------
export async function sendNewCoursePublishedEmail({
  studentEmail,
  studentName,
  courseTitle,
  courseId,
  description,
  level,
  duration,
}: {
  studentEmail: string;
  studentName: string;
  courseTitle: string;
  courseId: string;
  description: string;
  level?: string;
  duration?: string;
}) {
  const def = LIFECYCLE_TEMPLATES_DEFINITIONS.new_course_published;
  const { subject, bodyContent } = await resolveLifecycleContent(
    "new_course_published",
    {
      studentName,
      courseTitle,
      level: level || "All Levels",
      duration: duration || "Self-Paced",
      description: description || "Hands-on, practical curriculum with verified certificates.",
    },
    def.defaultSubject,
    def.defaultBody
  );

  const html = buildEmailTemplate({
    subject,
    studentName,
    bodyContent,
    categoryBadge: "New Course",
    ctaText: "Enroll in Course",
    ctaUrl: `${SITE_URL}/courses`,
    siteUrl: SITE_URL,
  });

  return safeSendMail({
    to: studentEmail,
    recipientName: studentName,
    subject,
    html,
    category: "new_course_published",
    campaignLabel: "New Course Alert",
    courseTitle,
  });
}

// -----------------------------------------------------------------------------
// 13. Course Status Changed to Ongoing (Coming Soon -> Ongoing)
// -----------------------------------------------------------------------------
export async function sendCourseStatusOngoingEmail({
  studentEmail,
  studentName,
  courseTitle,
  courseId,
}: {
  studentEmail: string;
  studentName: string;
  courseTitle: string;
  courseId: string;
}) {
  const def = LIFECYCLE_TEMPLATES_DEFINITIONS.course_status_ongoing;
  const { subject, bodyContent } = await resolveLifecycleContent(
    "course_status_ongoing",
    { studentName, courseTitle },
    def.defaultSubject,
    def.defaultBody
  );

  const html = buildEmailTemplate({
    subject,
    studentName,
    bodyContent,
    categoryBadge: "Course Live",
    ctaText: "Open Course Dashboard",
    ctaUrl: `${SITE_URL}/student/courses`,
    siteUrl: SITE_URL,
  });

  return safeSendMail({
    to: studentEmail,
    recipientName: studentName,
    subject,
    html,
    category: "course_status_ongoing",
    campaignLabel: "Course Live",
    courseTitle,
  });
}
