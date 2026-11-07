import { createSmtpTransporter, getActiveSmtpConfig } from "@/lib/services/mailer";
import { buildEmailTemplate, htmlToPlainText } from "@/lib/services/emailTemplates";
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
    const config = getActiveSmtpConfig();
    if (!config.user || !config.pass) {
      console.warn("SMTP not configured. Skipping lifecycle email to:", to);
      return false;
    }

    const transporter = createSmtpTransporter(config);
    const textFallback = htmlToPlainText(html);

    await transporter.sendMail({
      from: `"${config.fromName || SITE_NAME}" <${config.fromEmail || config.user}>`,
      to: `"${recipientName}" <${to}>`,
      subject,
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
  const subject = `[Auto AI Academy] Welcome to ${courseTitle} — Getting Started`;
  const bodyContent = `
    <p>Welcome to <strong>${courseTitle}</strong> on ${SITE_NAME}! We are pleased to confirm your enrollment in this cohort.</p>
    <p>Here are key guidelines to make the most of your learning journey:</p>
    <ul style="margin: 0 0 16px 20px; line-height: 1.8; color: #334155;">
      <li><strong>Structured Video Lectures:</strong> Available directly on your Student Portal and YouTube playlist.</li>
      <li><strong>Practical Assignments:</strong> Submit your project code or files on time to collect stars (★) and climb the global Leaderboard.</li>
      <li><strong>24/7 AI Study Tutor:</strong> If you ever encounter a bug or concept question, access your AI Study Tutor from your dashboard anytime.</li>
      <li><strong>Verified Certificate:</strong> Submit at least 80% of all assignments to earn your official, QR-verified credential upon completion.</li>
    </ul>
    ${
      youtubeUrl
        ? `<p style="margin-top: 16px;"><a href="${youtubeUrl}" target="_blank" style="color: #0284c7; font-weight: 600; text-decoration: underline;">Open Recommended YouTube Video Series &rarr;</a></p>`
        : ""
    }
    <p>You can now open your portal and begin Lesson 1 at your own pace.</p>
  `;

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
  const subject = `[Auto AI Academy] Continue Your Learning: Explore Available Courses`;
  const bodyContent = `
    <p>We noticed you recently created your student account on ${SITE_NAME}, but haven't enrolled in a course yet.</p>
    <p>Our practical curriculum is designed to help you build real-world AI and programming skills:</p>
    <ul style="margin: 0 0 16px 20px; line-height: 1.8; color: #334155;">
      <li><strong>Python Programming:</strong> Master fundamentals, algorithms, and real automation scripts.</li>
      <li><strong>n8n & AI Automations:</strong> Build intelligent workflows, webhooks, and customer support agents.</li>
    </ul>
    <p>Enrollment is 1-click and immediately gives you access to assignment briefs, the AI Tutor, and verified certificates.</p>
    <p>Explore our active catalog below and choose the path that matches your career goals.</p>
  `;

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
  const subject = `[Auto AI Academy] New Assignment Posted: "${assignmentTitle}" (${courseTitle})`;
  const bodyContent = `
    <p>A new practical assignment has been published for your enrolled course <strong>${courseTitle}</strong>.</p>
    <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 0 0 6px 0; font-weight: 700; color: #0f172a; font-size: 15px;">${assignmentTitle}</p>
      <p style="margin: 0 0 6px 0; font-size: 13px; color: #64748b;"><strong>Submission Deadline:</strong> ${dueDateFormatted}</p>
      <p style="margin: 0; font-size: 14px; color: #334155;">${
        description
          ? description.slice(0, 220) + (description.length > 220 ? "..." : "")
          : "Please review the requirements in your student portal."
      }</p>
    </div>
    <p>Submitting on time ensures full timeliness marks and strengthens your standing on the Leaderboard.</p>
    <p>If you need guidance or code hints, open your <strong>AI Study Tutor</strong> anytime on the portal.</p>
  `;

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
  const subject = `[Auto AI Academy] Reminder: 24 Hours Remaining for "${assignmentTitle}"`;
  const bodyContent = `
    <p>This is a notification that the deadline for <strong>"${assignmentTitle}"</strong> in <em>${courseTitle}</em> is in less than 24 hours.</p>
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 0 0 4px 0; font-weight: 700; color: #92400e; font-size: 15px;">Due Date: ${dueDateFormatted}</p>
      <p style="margin: 0; font-size: 13px; color: #b45309;">Ensure your Google Drive or GitHub link is shared with public view permissions before submitting.</p>
    </div>
    <p>Submitting before the deadline awards full timeliness points and helps maintain your leaderboard rank.</p>
  `;

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
  const subject = `[Auto AI Academy] Submission Confirmation: "${assignmentTitle}"`;
  const bodyContent = `
    <p>Thank you for submitting your work for <strong>"${assignmentTitle}"</strong>.</p>
    <p>Your submission has been securely logged and placed in the faculty grading queue.</p>
    <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 0 0 4px 0; font-weight: 700; color: #0f172a; font-size: 14px;">Evaluation Criteria:</p>
      <ul style="margin: 0 0 0 16px; font-size: 13px; color: #475569; line-height: 1.6;">
        <li>Correctness & Code Functionality</li>
        <li>Creativity & Technical Cleanliness</li>
        <li>Submission Timeliness</li>
      </ul>
    </div>
    <p>Once graded, your stars and feedback will be published directly to your Student Dashboard.</p>
  `;

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
  const subject = `[Auto AI Academy] Course Update: "${assignmentTitle}" in ${courseTitle}`;
  const bodyContent = `
    <p>We noted that the primary deadline for <strong>"${assignmentTitle}"</strong> in <em>${courseTitle}</em> has elapsed without a registered submission.</p>
    <p>In technical education, consistent learning matters far more than a single milestone. Keep working through your lessons and preparing for upcoming modules.</p>
    <p>Upon course completion, late submission catch-up windows become available to help you reach the 80% mark required for graduation.</p>
  `;

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
  const subject = `[Auto AI Academy] Grade Released: "${assignmentTitle}" (${finalStars.toFixed(1)}/5.0 Stars)`;
  const bodyContent = `
    <p>Your submission for <strong>"${assignmentTitle}"</strong> has been reviewed and officially graded by the instruction team.</p>
    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px 20px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 0 0 10px 0; font-size: 17px; font-weight: 800; color: #15803d;">
        Final Score: ${finalStars.toFixed(1)} / 5.0 Stars (★)
      </p>
      <div style="font-size: 13px; color: #166534; line-height: 1.6;">
        • Correctness: <strong>${correctness.toFixed(1)} ★</strong><br/>
        • Creativity: <strong>${creativity.toFixed(1)} ★</strong><br/>
        • Timeliness: <strong>${timeliness.toFixed(1)} ★</strong>
      </div>
    </div>
    <p>Your stars have been credited to your student profile and updated on the global Leaderboard.</p>
  `;

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
  const isTop10 = rank <= 10;
  const subject = isTop10
    ? `[Auto AI Academy] Leaderboard Achievement: Rank #${rank} Milestone`
    : `[Auto AI Academy] Leaderboard Progress Update (${totalStars.toFixed(1)} Stars)`;

  const bodyContent = isTop10
    ? `
      <p>Congratulations! Your recent assignment scores have positioned you in the <strong>Top 10</strong> across all active students at Auto AI Academy.</p>
      <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 16px 20px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; font-size: 17px; font-weight: 800; color: #854d0e;">
          Academy Rank: #${rank} &bull; Total Stars: ${totalStars.toFixed(1)} ★
        </p>
      </div>
      <p>Your dedication serves as an inspiration to the community. Maintain your momentum in upcoming modules to preserve your podium standing.</p>
    `
    : `
      <p>Your recent assignment submissions have updated your standing on the student Leaderboard.</p>
      <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 16px 20px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a;">
          Current Rank: #${rank} &bull; Total Stars: ${totalStars.toFixed(1)} ★
        </p>
      </div>
      <p>Continue completing upcoming assignments on time to earn additional stars and advance your position.</p>
    `;

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
  const subject = `[Auto AI Academy] Certificate Eligibility Confirmed: ${courseTitle}`;
  const bodyContent = `
    <p>Congratulations! The course <strong>"${courseTitle}"</strong> has concluded, and you have achieved a <strong>${Math.round(
    submissionPercentage
  )}%</strong> assignment submission rate (satisfying the &ge;80% graduation requirement).</p>
    <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 16px 20px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 800; color: #065f46;">
        Verified Certificate Ready
      </p>
      <p style="margin: 0; font-size: 14px; color: #047857;">
        Both graduation criteria have been met: formal cohort completion and verified assignment submissions.
      </p>
    </div>
    <p>You can now generate and verify your credential from your Student Portal under <strong>Certificates</strong>.</p>
  `;

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
  const subject = `[Auto AI Academy] Catch-up Opportunity: Complete Your ${courseTitle} Certificate`;
  const bodyContent = `
    <p>The primary cohort for <strong>"${courseTitle}"</strong> has finished. Your current assignment completion is <strong>${Math.round(
    submissionPercentage
  )}%</strong> (80% is needed to graduate).</p>
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: #1e40af;">
        Previous Assignments Remain Open
      </p>
      <p style="margin: 0; font-size: 13px; color: #1d4ed8;">
        To ensure every committed student has the opportunity to earn their certificate, previously missed assignments remain accessible on your dashboard.
      </p>
    </div>
    <p>Once your submitted assignments reach the 80% threshold, your verified certificate will unlock automatically.</p>
  `;

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
  const subject = `[Auto AI Academy] 80% Milestone Achieved: Certificate Unlocked for ${courseTitle}`;
  const bodyContent = `
    <p>Congratulations! With your recent submissions, you have reached <strong>80% assignment completion</strong> in <strong>${courseTitle}</strong>.</p>
    <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 16px 20px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 800; color: #065f46;">
        Graduation Verified
      </p>
      <p style="margin: 0; font-size: 14px; color: #047857;">
        Your perseverance has earned you your official credential.
      </p>
    </div>
    <p>Visit your portal to claim your QR-verified certificate.</p>
  `;

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
  const subject = `[Auto AI Academy] New Course Released: "${courseTitle}"`;
  const bodyContent = `
    <p>We are pleased to introduce a brand new course on ${SITE_NAME}: <strong>${courseTitle}</strong>.</p>
    <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 0 0 6px 0; font-weight: 700; color: #0f172a; font-size: 15px;">${courseTitle}</p>
      <p style="margin: 0 0 6px 0; font-size: 13px; color: #64748b;">
        Level: <strong>${level || "All Levels"}</strong> &bull; Schedule: <strong>${duration || "Self-Paced"}</strong>
      </p>
      <p style="margin: 0; font-size: 14px; color: #334155;">
        ${
          description
            ? description.slice(0, 220) + (description.length > 220 ? "..." : "")
            : "Hands-on, practical curriculum with verified certificates."
        }
      </p>
    </div>
    <p>Enrollment is accessible directly from your Student Portal.</p>
  `;

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
  const subject = `[Auto AI Academy] Course Now Live: "${courseTitle}"`;
  const bodyContent = `
    <p>We are pleased to notify you that <strong>"${courseTitle}"</strong> is now officially <strong>Live & Ongoing</strong> on ${SITE_NAME}.</p>
    <p>Course lectures, syllabus outlines, and initial assignment briefs are now active on the portal.</p>
    <p>Access your dashboard to confirm your enrollment and review the introductory lecture.</p>
  `;

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
