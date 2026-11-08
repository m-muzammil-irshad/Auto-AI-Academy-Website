"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Send,
  Users,
  BookOpen,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  X,
  FileText,
  RefreshCw,
  ExternalLink,
  Zap,
  ShieldCheck,
  Award,
  Trophy,
  GraduationCap,
  Play,
  Check,
  Filter,
  UserCheck,
  Inbox,
  ArrowUpRight,
  Bookmark,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import { fetchCourses } from "@/lib/services/courses";
import { fetchAllUsers } from "@/lib/services/users";
import { fetchAllEnrollments } from "@/lib/services/enrollments";
import { fetchAllSubmissions } from "@/lib/services/submissions";
import { fetchAllAssignments } from "@/lib/services/assignments";
import { getDocs, query, orderBy, limit } from "firebase/firestore";
import { emailBroadcastsCol } from "@/lib/firebase/collections";
import { buildEmailTemplate } from "@/lib/services/emailTemplates";
import {
  fetchSavedEmailTemplates,
  autoSaveEmailTemplate,
  deleteSavedEmailTemplate,
  type SavedEmailTemplate,
} from "@/lib/services/emailTemplatesService";
import {
  fetchEmailDeliveryLogs,
  CATEGORY_LABELS,
  type EmailDeliveryRecord,
} from "@/lib/services/emailLogs";
import type { AppUser, Course, Enrollment, Submission, Assignment } from "@/lib/types";

type FilterType = "all" | "course" | "zero_submissions" | "active_submissions" | "top_performers";

interface PastBroadcast {
  id: string;
  subject: string;
  body: string;
  filterLabel: string;
  courseTitle?: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  sentAt?: any;
  adminEmail?: string;
}

const PRESET_TEMPLATES = [
  {
    label: "🚀 New Course Announcement",
    subject: "New Course Announcement: Practical Curriculum",
    body: `We are pleased to introduce a brand new practical course on Auto AI Academy!

Whether you want to build autonomous AI workflows, master Python programming, or automate your business leads, this curriculum is designed for 100% hands-on results.

Course Highlights:
• Structured video lectures with real-world case studies
• Practical assignments with real grading and QR-verified certificates
• 24/7 AI Study Tutor assistance for coding doubts

Visit your student portal to enroll and begin your first module today.`,
  },
  {
    label: "📝 Assignment Deadline Reminder",
    subject: "Assignment Reminder: Submission Deadline Approaching for {{courseTitle}}",
    body: `This is a reminder regarding your active assignment for {{courseTitle}}.

Submitting your assignments on time ensures full timeliness marks, helps climb the global Leaderboard, and fulfills the criteria for your official QR-verified Certificate.

Submission Checklist:
1. Upload your code or project files to Google Drive or GitHub.
2. Ensure link access is set to public ("Anyone with the link can view").
3. Open your Student Portal, paste your submission link, and submit.

If you have questions, our AI Study Tutor is available on your dashboard anytime.`,
  },
  {
    label: "⭐ Weekly Study & Motivation Check-in",
    subject: "Weekly Academic Check-in: Consistency in Practice",
    body: `Consistency is the secret to mastering artificial intelligence, programming, and automation.

Have you worked through this week's video modules? Make sure to write and run code regularly, experiment with scripts, and review lecture notes.

If you ever encounter an error or conceptual doubt, feel free to ask our 24/7 AI Study Tutor on your dashboard.

Keep up the great work and continued progress!`,
  },
  {
    label: "🎓 Certificate Criteria Update",
    subject: "Academic Notice: Verified Certificate Criteria",
    body: `Here is an important update regarding the issuance of verified course credentials at Auto AI Academy.

Criteria to earn your official certificate:
• Submit at least 80% of all assignments in the course.
• Receive passing grades (stars) evaluated by our instruction team.
• Once the cohort concludes, generate your QR-verified certificate directly from your Student Portal.

Log in to your student dashboard to track your assignment progress and current submission rate.`,
  },
];

interface AutomatedFlow {
  id: string;
  group: "onboarding" | "assignments" | "grading" | "courses";
  title: string;
  triggerType: "Instant (Event)" | "Scheduled (Cron)" | "Admin Action";
  triggerDescription: string;
  targetAudience: string;
  sampleSubject: string;
  keyFeatures: string[];
}

const AUTOMATED_FLOWS: AutomatedFlow[] = [
  // Group A: Onboarding & Student Engagement
  {
    id: "enrollment_welcome",
    group: "onboarding",
    title: "Course Enrollment Welcome",
    triggerType: "Instant (Event)",
    triggerDescription: "Triggered instantly when a student clicks 'Enroll Now' on any course.",
    targetAudience: "The newly enrolled student",
    sampleSubject: "Welcome to [Course Title] — Getting Started",
    keyFeatures: [
      "Congratulates student & confirms enrollment",
      "Explains practical assignments, star grading & certificate policy",
      "Highlights 24/7 AI Study Tutor available in course portal",
      "Direct button to open student dashboard and start learning",
    ],
  },
  {
    id: "inactive_48h",
    group: "onboarding",
    title: "48-Hour Inactive Signup Re-engagement",
    triggerType: "Scheduled (Cron)",
    triggerDescription: "Dispatched automatically when an account is 48 hours old with 0 course enrollments.",
    targetAudience: "Students with 0 enrollments (deduplicated via logs)",
    sampleSubject: "Continue Your Learning: Explore Available Courses",
    keyFeatures: [
      "Friendly motivational push to take their first step",
      "Features top 3 courses (Agentic AI, Python Automations, Lead Gen)",
      "Reminds student that all courses are structured with certificates",
      "1-Click button to browse catalog and enroll",
    ],
  },
  {
    id: "missed_deadline",
    group: "onboarding",
    title: "Missed Deadline Follow-up & Motivation",
    triggerType: "Scheduled (Cron)",
    triggerDescription: "Sent when an assignment deadline passed within the last 24h with no submission.",
    targetAudience: "Enrolled students who missed the deadline",
    sampleSubject: "Course Update: [Assignment Title] in [Course Title]",
    keyFeatures: [
      "Compassionate, non-judgmental encouragement",
      "Emphasizes consistency over perfection",
      "Reminds them to ask AI Study Tutor for conceptual help",
      "Direct link to continue practicing in the portal",
    ],
  },

  // Group B: Assignments & Academic Journey
  {
    id: "new_assignment",
    group: "assignments",
    title: "New Course Assignment Published",
    triggerType: "Admin Action",
    triggerDescription: "Sent the instant faculty publishes a new assignment for any course.",
    targetAudience: "All students enrolled in that specific course",
    sampleSubject: "New Assignment Posted: [Title] ([Course Title])",
    keyFeatures: [
      "Displays assignment title, topic description & due date",
      "Clearly states grading criteria & star reward (★)",
      "Highlights that 24/7 AI Tutor is ready to answer questions",
      "Direct button to view instructions and submit code",
    ],
  },
  {
    id: "reminder_24h",
    group: "assignments",
    title: "24-Hour Assignment Deadline Reminder",
    triggerType: "Scheduled (Cron)",
    triggerDescription: "Dispatched automatically 24 hours before an assignment deadline is reached.",
    targetAudience: "Enrolled students who have not yet submitted (deduplicated)",
    sampleSubject: "Reminder: 24 Hours Remaining for [Assignment Title]",
    keyFeatures: [
      "High-urgency friendly reminder with exact countdown",
      "Explains step-by-step how to submit Google Drive or GitHub link",
      "Reminds students that 80%+ submissions are required for certificate",
      "Encourages earning stars to rank on the Leaderboard",
    ],
  },
  {
    id: "submission_received",
    group: "assignments",
    title: "Submission Received Confirmation",
    triggerType: "Instant (Event)",
    triggerDescription: "Fires the second a student successfully submits their assignment link in the portal.",
    targetAudience: "The submitting student",
    sampleSubject: "Submission Confirmation: [Assignment Title]",
    keyFeatures: [
      "Instant confirmation receipt that project link is recorded",
      "Shows submitted link for student's reference",
      "Reassures them that faculty will review and grade soon",
      "Shows link to check grades on Student Portal",
    ],
  },

  // Group C: Evaluation, Stars & Leaderboard
  {
    id: "submission_graded",
    group: "grading",
    title: "Assignment Graded & Stars Breakdown",
    triggerType: "Admin Action",
    triggerDescription: "Fires instantly when faculty completes grading in the Admin Review console.",
    targetAudience: "The student whose assignment was graded",
    sampleSubject: "Grade Released: [Assignment Title] ([Stars]/5.0 Stars)",
    keyFeatures: [
      "Displays full stars earned with breakdown (Correctness, Creativity, Timeliness)",
      "Includes personalized faculty comments & feedback",
      "Shows updated all-time stars tally",
      "Direct button to view feedback and progress in student portal",
    ],
  },
  {
    id: "leaderboard_rank",
    group: "grading",
    title: "Top 10 Leaderboard Rank Celebration",
    triggerType: "Instant (Event)",
    triggerDescription: "Triggered when a graded submission elevates the student into the Top 10 ranks.",
    targetAudience: "Top 10 high-achieving student",
    sampleSubject: "Leaderboard Achievement: Rank #[Rank] Milestone",
    keyFeatures: [
      "Celebratory email recognizing high academic performance",
      "Displays official rank badge (#1 through #10) and total stars",
      "Encourages continuing consistency to remain at the top",
      "Button to view full academy Leaderboard",
    ],
  },
  {
    id: "catchup_80_percent_reached",
    group: "grading",
    title: "Catch-up 80% Reached — Certificate Unlocked",
    triggerType: "Instant (Event)",
    triggerDescription: "Fires when a student submitting late catch-up work in a completed course crosses 80%.",
    targetAudience: "Graduating catch-up student",
    sampleSubject: "🎉 Fantastic Work! You Reached 80% Submissions — Claim Your Certificate!",
    keyFeatures: [
      "Celebrates persevering and completing required coursework",
      "Confirms official graduation from the completed course",
      "Direct WhatsApp contact link to claim official QR-verified PDF certificate",
    ],
  },

  // Group D: Course Completion & Course Launches
  {
    id: "course_completed_eligible",
    group: "courses",
    title: "Course Completed: 80%+ Certificate Eligible",
    triggerType: "Admin Action",
    triggerDescription: "Fires when admin marks course as 'completed' for students who submitted ≥ 80%.",
    targetAudience: "Qualified graduating students (≥ 80% submissions)",
    sampleSubject: "🎓 Congratulations! You Graduated [Course Title] — Claim Your Verified Certificate!",
    keyFeatures: [
      "Official graduation congratulations from Auto AI Academy",
      "Confirms ≥ 80% submission completion criteria met",
      "Direct WhatsApp button to contact admin (+92 322 7109261) for QR certificate",
      "Highlights sharing credential on LinkedIn & resume",
    ],
  },
  {
    id: "course_completed_catchup",
    group: "courses",
    title: "Course Completed: Catch-up Window Open (<80%)",
    triggerType: "Admin Action",
    triggerDescription: "Fires when admin marks course as 'completed' for students who submitted < 80%.",
    targetAudience: "Incomplete students (< 80% submissions)",
    sampleSubject: "🔄 Catch-up Window Open: Complete Your Assignments for [Course Title] Certificate",
    keyFeatures: [
      "Informs student that cohort lectures ended but assignments remain OPEN",
      "Explains late catch-up policy: unlocks certificate once 80% is reached",
      "Notes that catch-up submissions do not alter cohort leaderboard",
      "Direct link to assignments page to complete pending tasks",
    ],
  },
  {
    id: "new_course_published",
    group: "courses",
    title: "New Course Published Announcement",
    triggerType: "Admin Action",
    triggerDescription: "Triggered whenever faculty publishes a brand-new course to the catalog.",
    targetAudience: "All registered students across the platform",
    sampleSubject: "🚀 New Course Released: [Course Title] is Now Live!",
    keyFeatures: [
      "Showcases course syllabus, practical outcomes & prerequisites",
      "Explains 100% free enrollment & verified certification",
      "1-Click button to enroll and begin lesson 1",
    ],
  },
  {
    id: "course_status_ongoing",
    group: "courses",
    title: "Course Status Changed to Ongoing (Enrollment Open)",
    triggerType: "Admin Action",
    triggerDescription: "Fires when an upcoming course ('soon') is officially activated to 'ongoing'.",
    targetAudience: "All registered students across the platform",
    sampleSubject: "🟢 Now Open for Enrollment: [Course Title] is Officially Live!",
    keyFeatures: [
      "Alerts interested students that lectures and assignments are live",
      "Urges early enrollment to participate in cohort rankings",
      "Direct button to join course and access lectures",
    ],
  },
];

function formatLogTime(ts: any) {
  if (!ts) return "Recently";
  let date: Date;
  if (typeof ts.toDate === "function") {
    date = ts.toDate();
  } else if (typeof ts === "number") {
    date = new Date(ts);
  } else if (ts.seconds) {
    date = new Date(ts.seconds * 1000);
  } else {
    date = new Date(ts);
  }
  if (isNaN(date.getTime())) return "Recently";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function AdminBroadcastPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [pastBroadcasts, setPastBroadcasts] = useState<PastBroadcast[]>([]);

  // Section Switcher: "manual" | "history" | "automation"
  const [activeSection, setActiveSection] = useState<"manual" | "history" | "automation">("manual");
  const [selectedFlowGroup, setSelectedFlowGroup] = useState<
    "all" | "onboarding" | "assignments" | "grading" | "courses"
  >("all");
  const [isCheckingAutomation, setIsCheckingAutomation] = useState(false);
  const [automationResults, setAutomationResults] = useState<{
    inactiveEmailsSent: number;
    deadlineRemindersSent: number;
    missedDeadlineEmailsSent: number;
    errors: string[];
    timestamp: string;
  } | null>(null);

  // Delivery History State
  const [deliveryLogs, setDeliveryLogs] = useState<EmailDeliveryRecord[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState("all");
  const [historySearch, setHistorySearch] = useState("");
  const [selectedLogForModal, setSelectedLogForModal] = useState<EmailDeliveryRecord | null>(null);
  const [selectedTemplateForModal, setSelectedTemplateForModal] = useState<AutomatedFlow | null>(null);

  const filteredLogs = useMemo(() => {
    return deliveryLogs.filter((log: EmailDeliveryRecord) => {
      if (historyCategoryFilter !== "all" && log.category !== historyCategoryFilter) {
        return false;
      }
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase();
        const matchName = log.recipientName?.toLowerCase().includes(q);
        const matchEmail = log.recipientEmail?.toLowerCase().includes(q);
        const matchSub = log.subject?.toLowerCase().includes(q);
        const matchCourse = log.courseTitle?.toLowerCase().includes(q);
        return Boolean(matchName || matchEmail || matchSub || matchCourse);
      }
      return true;
    });
  }, [deliveryLogs, historyCategoryFilter, historySearch]);

  // Composer States
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  // Dialogs & Modals
  const [viewRecipientsOpen, setViewRecipientsOpen] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);

  // Statuses
  const [isSending, setIsSending] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Saved Email Templates
  const [savedTemplates, setSavedTemplates] = useState<SavedEmailTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateTab, setTemplateTab] = useState<"saved" | "presets">("saved");
  const [templateSavedNotice, setTemplateSavedNotice] = useState(false);

  const loadSavedTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const list = await fetchSavedEmailTemplates();
      setSavedTemplates(list);
    } catch (err) {
      console.warn("Could not load templates:", err);
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    void loadSavedTemplates();
  }, [loadSavedTemplates]);

  const handleManualSaveTemplate = async () => {
    if (!subject.trim() || !body.trim()) {
      alert("Please enter both a subject and email body before saving as a template.");
      return;
    }
    await autoSaveEmailTemplate({
      subject: subject.trim(),
      body: body.trim(),
      source: "manual",
    });
    setTemplateSavedNotice(true);
    setTimeout(() => setTemplateSavedNotice(false), 3000);
    await loadSavedTemplates();
  };

  const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this saved template?")) return;
    await deleteSavedEmailTemplate(id);
    await loadSavedTemplates();
  };

  // Run On-Demand Automation Checks
  const handleRunAutomationChecks = async () => {
    setIsCheckingAutomation(true);
    try {
      const res = await fetch("/api/cron/email-automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          users,
          courses,
          enrollments,
          submissions,
          assignments,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger automation checks.");
      }
      setAutomationResults({
        inactiveEmailsSent: data.results?.inactiveEmailsSent || 0,
        deadlineRemindersSent: data.results?.deadlineRemindersSent || 0,
        missedDeadlineEmailsSent: data.results?.missedDeadlineEmailsSent || 0,
        errors: data.results?.errors || [],
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      alert("Error running automation check: " + err.message);
    } finally {
      setIsCheckingAutomation(false);
    }
  };

  // Load platform users, courses, enrollments & past broadcasts
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allUsers, allCourses, allEnrollments, allSubmissions, allAssignments] =
        await Promise.all([
          fetchAllUsers(),
          fetchCourses(),
          fetchAllEnrollments(),
          fetchAllSubmissions(),
          fetchAllAssignments(),
        ]);

      setUsers(allUsers);
      setCourses(allCourses);
      setEnrollments(allEnrollments);
      setSubmissions(allSubmissions);
      setAssignments(allAssignments);

      if (allCourses.length > 0 && !selectedCourseId) {
        setSelectedCourseId(allCourses[0].id);
      }

      // Load past broadcast logs
      try {
        const q = query(emailBroadcastsCol(), orderBy("sentAt", "desc"), limit(10));
        const snap = await getDocs(q);
        const logs: PastBroadcast[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<PastBroadcast, "id">),
        }));
        setPastBroadcasts(logs);
      } catch (err) {
        console.warn("Could not load broadcast history:", err);
      }

      // Load individual delivery logs
      try {
        const dLogs = await fetchEmailDeliveryLogs("all", 150);
        setDeliveryLogs(dLogs);
      } catch (err) {
        console.warn("Could not load delivery history logs:", err);
      }
    } catch (err) {
      console.error("Error loading broadcast data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId]);

  const handleRefreshDeliveryLogs = async () => {
    setLoadingLogs(true);
    try {
      const dLogs = await fetchEmailDeliveryLogs("all", 150);
      setDeliveryLogs(dLogs);
    } catch (err) {
      console.warn("Could not refresh delivery logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    void loadData();
    if (user?.email) {
      setTestEmailAddress(user.email);
    }
  }, [loadData, user]);

  // Map courses and submissions for fast lookup
  const courseMap = useMemo(
    () => new Map(courses.map((c) => [c.id, c])),
    [courses]
  );

  const submissionsByUser = useMemo(() => {
    const map = new Map<string, number>();
    submissions.forEach((s) => {
      map.set(s.userId, (map.get(s.userId) || 0) + 1);
    });
    return map;
  }, [submissions]);

  const enrollmentsByUser = useMemo(() => {
    const map = new Map<string, string[]>();
    enrollments.forEach((e) => {
      const list = map.get(e.userId) || [];
      list.push(e.courseId);
      map.set(e.userId, list);
    });
    return map;
  }, [enrollments]);

  // Filter Target Recipients
  const targetRecipients = useMemo(() => {
    const studentUsers = users.filter((u) => u.role === "student" && u.email && u.email.includes("@"));

    switch (filterType) {
      case "all":
        return studentUsers;

      case "course": {
        if (!selectedCourseId) return [];
        const enrolledUserIds = new Set(
          enrollments
            .filter((e) => e.courseId === selectedCourseId)
            .map((e) => e.userId)
        );
        return studentUsers.filter((u) => enrolledUserIds.has(u.uid));
      }

      case "zero_submissions":
        return studentUsers.filter((u) => (submissionsByUser.get(u.uid) || 0) === 0);

      case "active_submissions":
        return studentUsers.filter((u) => (submissionsByUser.get(u.uid) || 0) > 0);

      case "top_performers":
        return [...studentUsers]
          .sort((a, b) => (b.allTimeStars || 0) - (a.allTimeStars || 0))
          .slice(0, 15);

      default:
        return studentUsers;
    }
  }, [users, filterType, selectedCourseId, enrollments, submissionsByUser]);

  const selectedCourseTitle = useMemo(() => {
    return courseMap.get(selectedCourseId)?.title || "Auto AI Academy Course";
  }, [courseMap, selectedCourseId]);

  // Insert template tag into body
  const insertVariable = (tag: string) => {
    setBody((prev) => `${prev} ${tag}`);
  };

  // Live preview HTML string
  const previewHtml = useMemo(() => {
    const sampleBody = body || "Start typing your email message in the write tab to see live preview here...";
    const personalizedBody = sampleBody
      .replace(/\{\{name\}\}/gi, "Muhammad Ali")
      .replace(/\{\{email\}\}/gi, "student@example.com")
      .replace(/\{\{courseTitle\}\}/gi, selectedCourseTitle)
      .replace(/\{\{siteUrl\}\}/gi, "https://autoaiacademy.com");

    const personalizedSubject = (subject || "Email Subject Line")
      .replace(/\{\{name\}\}/gi, "Muhammad Ali")
      .replace(/\{\{courseTitle\}\}/gi, selectedCourseTitle);

    return buildEmailTemplate({
      subject: personalizedSubject,
      bodyContent: personalizedBody,
      studentName: "Muhammad Ali",
    });
  }, [body, subject, selectedCourseTitle]);

  // Send Test Email
  const handleSendTest = async () => {
    if (!testEmailAddress || !testEmailAddress.includes("@")) {
      alert("Please enter a valid test email address.");
      return;
    }
    if (!subject.trim() || !body.trim()) {
      alert("Please fill in both the subject and email body before testing.");
      return;
    }

    setIsSendingTest(true);
    setSendFeedback(null);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          action: "test",
          testEmail: testEmailAddress.trim(),
          subject: subject.trim(),
          body: body.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to send test email.");
      }

      setTestModalOpen(false);
      setSendFeedback({
        type: "success",
        message: `Test email sent to ${testEmailAddress}! Check your inbox (or spam).`,
      });
      void autoSaveEmailTemplate({
        subject: subject.trim(),
        body: body.trim(),
        source: "broadcast",
      }).then(() => loadSavedTemplates());
    } catch (err: any) {
      setSendFeedback({
        type: "error",
        message: err.message || "Failed to send test email. Please verify SMTP settings.",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Send Full Broadcast
  const handleSendBroadcast = async () => {
    if (!subject.trim() || !body.trim()) {
      alert("Subject and body cannot be empty.");
      return;
    }
    if (targetRecipients.length === 0) {
      alert("No recipients match the selected filter.");
      return;
    }

    setIsSending(true);
    setConfirmSendOpen(false);
    setSendFeedback(null);

    const filterLabelsMap: Record<FilterType, string> = {
      all: "All Registered Students",
      course: `Course: ${selectedCourseTitle}`,
      zero_submissions: "Students with 0 Submissions",
      active_submissions: "Active Learners (1+ Submissions)",
      top_performers: "Top 15 Leaderboard Achievers",
    };

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          action: "send",
          subject: subject.trim(),
          body: body.trim(),
          filterLabel: filterLabelsMap[filterType],
          courseTitle: selectedCourseTitle,
          recipients: targetRecipients.map((r) => ({
            uid: r.uid,
            name: r.name,
            email: r.email,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Broadcast sending failed.");
      }

      const { sent, failed, total } = data.result;
      setSendFeedback({
        type: "success",
        message: `Broadcast completed! Successfully delivered to ${sent} out of ${total} students.${
          failed > 0 ? ` (${failed} failed)` : ""
        }`,
      });

      // Reload broadcast history & saved templates
      void loadData();
      void autoSaveEmailTemplate({
        subject: subject.trim(),
        body: body.trim(),
        source: "broadcast",
      }).then(() => loadSavedTemplates());
    } catch (err: any) {
      setSendFeedback({
        type: "error",
        message: err.message || "Failed to send broadcast emails. Check SMTP configuration.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold sm:text-3xl text-slate-900 dark:text-white flex items-center gap-2.5">
              <Mail className="h-7 w-7 text-accent-500" />
              Email Broadcast System
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Dispatch targeted email announcements, course updates, and assignment alerts directly to student inboxes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSection === "manual" ? (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setTestModalOpen(true)}
                className="neu-btn rounded-full px-4 text-xs font-semibold cursor-pointer"
              >
                🧪 Test Email
              </Button>
              <Button
                type="button"
                onClick={() => setConfirmSendOpen(true)}
                disabled={isSending || targetRecipients.length === 0 || !subject.trim() || !body.trim()}
                className="neu-btn-primary rounded-full px-5 text-xs font-semibold cursor-pointer shadow-md flex items-center gap-1.5"
              >
                {isSending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Broadcast ({targetRecipients.length})
              </Button>
            </>
          ) : activeSection === "history" ? (
            <Button
              type="button"
              onClick={handleRefreshDeliveryLogs}
              disabled={loadingLogs}
              className="neu-btn rounded-full px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingLogs ? "animate-spin" : ""}`} />
              Refresh Logs
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleRunAutomationChecks}
              disabled={isCheckingAutomation}
              className="neu-btn-primary rounded-full px-5 text-xs font-semibold cursor-pointer shadow-md flex items-center gap-1.5"
            >
              {isCheckingAutomation ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
              {isCheckingAutomation ? "Checking..." : "Run Checks Now"}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Top Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
        <button
          type="button"
          onClick={() => setActiveSection("manual")}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === "manual"
              ? "neu-pressed-sm text-accent-600 dark:text-accent-400 border border-accent-500/30 bg-accent-500/10 shadow-sm"
              : "neu-flat-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Mail className="h-4 w-4" />
          Compose Broadcast
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("history")}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === "history"
              ? "neu-pressed-sm text-accent-600 dark:text-accent-400 border border-accent-500/30 bg-accent-500/10 shadow-sm"
              : "neu-flat-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Clock className="h-4 w-4 text-indigo-500" />
          Delivery History & Recipient Logs
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold">
            {deliveryLogs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("automation")}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === "automation"
              ? "neu-pressed-sm text-accent-600 dark:text-accent-400 border border-accent-500/30 bg-accent-500/10 shadow-sm"
              : "neu-flat-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Zap className="h-4 w-4 text-amber-500" />
          Lifecycle Automations
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold">
            13 Active
          </span>
        </button>
      </div>

      {/* Feedback Banner */}
      <AnimatePresence>
        {sendFeedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`rounded-2xl p-4 flex items-start gap-3 border ${
              sendFeedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                : "bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300"
            }`}
          >
            {sendFeedback.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            )}
            <div className="flex-1 text-sm font-medium">{sendFeedback.message}</div>
            <button
              onClick={() => setSendFeedback(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area: Manual vs Automated Lifecycles */}
      {activeSection === "manual" ? (
        /* Main Grid: Composer & Filters */
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Filter & Audience Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="neu-flat border-none">
              <CardHeader>
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent-500" />
                  Select Target Audience
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Audience Filter:
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: "all", label: "👥 All Registered Students", desc: "Every student on the platform" },
                      { id: "course", label: "📚 Specific Course Enrolled", desc: "Students enrolled in a specific course" },
                      { id: "zero_submissions", label: "⏳ Inactive (0 Submissions)", desc: "Students who haven't submitted yet" },
                      { id: "active_submissions", label: "⭐ Active Learners (1+ Submissions)", desc: "Students actively submitting tasks" },
                      { id: "top_performers", label: "🏆 Top 15 Leaderboard Achievers", desc: "Highest ranked students" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilterType(f.id as FilterType)}
                        className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer border ${
                          filterType === f.id
                            ? "neu-pressed-sm border-accent-500/40 bg-accent-500/5 text-accent-600 dark:text-accent-400 font-semibold"
                            : "neu-flat-sm border-black/5 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-black/10"
                        }`}
                      >
                        <div className="text-xs font-bold">{f.label}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Course Selection Dropdown (Only shown if course filter is active) */}
                {filterType === "course" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5"
                  >
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-accent-500" />
                      Select Course:
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full rounded-2xl neu-pressed-sm p-3 text-xs text-slate-900 dark:text-white bg-inherit border-none focus:outline-none"
                    >
                      {courses.map((c) => {
                        const count = enrollments.filter((e) => e.courseId === c.id).length;
                        return (
                          <option key={c.id} value={c.id} className="dark:bg-slate-900">
                            {c.title} ({count} enrolled)
                          </option>
                        );
                      })}
                    </select>
                  </motion.div>
                )}

                {/* Dynamic Target Count Badge & Viewer */}
                <div className="pt-3 border-t border-black/5 dark:border-white/5">
                  <div className="flex items-center justify-between p-3 rounded-2xl neu-pressed-sm bg-accent-500/5 border border-accent-500/20">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Targeted Recipients
                      </span>
                      <span className="text-xl font-heading font-extrabold text-accent-600 dark:text-accent-400 tabular-nums">
                        {loading ? "..." : targetRecipients.length}{" "}
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-body">
                          students
                        </span>
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setViewRecipientsOpen(true)}
                      disabled={targetRecipients.length === 0}
                      className="neu-btn rounded-full text-xs font-semibold px-3 py-1.5 cursor-pointer"
                    >
                      View List
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Saved Templates & Quick Presets */}
            <Card className="neu-flat border-none">
              <CardHeader className="flex flex-col gap-2 pb-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Email Templates
                  </h2>
                </div>
                {/* Sub tabs: Saved vs Presets */}
                <div className="grid grid-cols-2 gap-1 p-1 neu-pressed-sm rounded-lg text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setTemplateTab("saved")}
                    className={`py-1 text-center rounded-md transition-all ${
                      templateTab === "saved"
                        ? "bg-white dark:bg-slate-800 text-accent-600 dark:text-accent-400 font-bold shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Saved ({savedTemplates.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateTab("presets")}
                    className={`py-1 text-center rounded-md transition-all ${
                      templateTab === "presets"
                        ? "bg-white dark:bg-slate-800 text-accent-600 dark:text-accent-400 font-bold shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Starter ({PRESET_TEMPLATES.length})
                  </button>
                </div>
              </CardHeader>
              <CardBody className="space-y-2 pt-1">
                {templateTab === "saved" ? (
                  <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                    {loadingTemplates ? (
                      <p className="text-[11px] text-slate-400 py-3 text-center">Loading templates...</p>
                    ) : savedTemplates.length === 0 ? (
                      <div className="p-3 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500">
                        <Bookmark className="h-4 w-4 mx-auto mb-1 text-slate-400" />
                        Har email jo aap send krtay hain yahan automatically template ban kar save ho jati hai ta k next time 1-click se use kar sakein.
                      </div>
                    ) : (
                      savedTemplates.map((tmpl) => (
                        <div
                          key={tmpl.id}
                          onClick={() => {
                            setSubject(tmpl.subject);
                            setBody(tmpl.body);
                          }}
                          className="group relative flex items-start justify-between gap-2 p-2.5 rounded-xl neu-flat-sm text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-accent-500 hover:scale-[1.01] transition-all cursor-pointer border border-black/5 dark:border-white/5"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {tmpl.subject}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 line-clamp-1">
                              {tmpl.body.slice(0, 70)}...
                            </p>
                          </div>
                          <button
                            type="button"
                            title="Delete template"
                            onClick={(e) => handleDeleteTemplate(tmpl.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-opacity"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {PRESET_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSubject(tmpl.subject);
                          setBody(tmpl.body);
                        }}
                        className="w-full text-left p-2.5 rounded-xl neu-flat-sm text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-accent-500 hover:scale-[1.01] transition-all cursor-pointer border border-black/5 dark:border-white/5"
                      >
                        {tmpl.label}
                      </button>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Right Column: Email Composer & Live Preview (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="neu-flat border-none">
              <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent-500" />
                  <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                    Compose Email Message
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleManualSaveTemplate}
                    className="neu-btn text-xs font-medium flex items-center gap-1.5 rounded-full px-3 py-1.5"
                    title="Save current subject & body as a reusable template"
                  >
                    <Bookmark className="h-3.5 w-3.5 text-accent-500" />
                    <span>{templateSavedNotice ? "Saved!" : "Save Template"}</span>
                  </Button>

                  {/* Tab Switcher: Write vs Preview */}
                  <div className="flex items-center gap-1 neu-pressed-sm p-1 rounded-full">
                  <button
                    type="button"
                    onClick={() => setActiveTab("write")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "write"
                        ? "neu-btn text-accent-600 dark:text-accent-400 bg-white dark:bg-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Write Message
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      activeTab === "preview"
                        ? "neu-btn text-accent-600 dark:text-accent-400 bg-white dark:bg-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <Eye className="h-3 w-3" />
                    Live Preview
                  </button>
                </div>
              </div>
            </CardHeader>

              <CardBody className="space-y-5 pt-4">
                {activeTab === "write" ? (
                  <>
                    {/* Subject Input */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Email Subject Line:
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {subject.length} characters
                        </span>
                      </div>
                      <Input
                        type="text"
                        placeholder="e.g. 🚀 Important Announcement: New Python Module is Live!"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="rounded-2xl neu-pressed-sm border-none text-sm font-medium"
                      />
                    </div>

                    {/* Personalization Tags Toolbar */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Click to insert template variables:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { tag: "{{name}}", label: "Student Name" },
                          { tag: "{{courseTitle}}", label: "Course Title" },
                          { tag: "{{siteUrl}}", label: "Platform Link" },
                        ].map((item, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => insertVariable(item.tag)}
                            className="neu-flat-sm text-xs px-2.5 py-1 rounded-full font-mono text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-all cursor-pointer border border-indigo-500/20 bg-indigo-500/5 font-semibold"
                          >
                            + {item.tag} <span className="text-[10px] text-slate-400 font-sans">({item.label})</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Body Textarea */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Email Message Body:
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {body.split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>
                      <Textarea
                        rows={10}
                        placeholder={`Write your email content here...\n\nTip: You can use {{name}} to personalize with the student's actual name!`}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="rounded-2xl neu-pressed-sm border-none text-sm font-body leading-relaxed custom-scrollbar"
                      />
                    </div>
                  </>
                ) : (
                  /* Live Preview Frame */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-black/5 dark:border-white/5">
                      <span>
                        Subject: <strong>{subject || "(No subject provided)"}</strong>
                      </span>
                      <span>Sample recipient: <strong>Muhammad Ali</strong></span>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white">
                      <iframe
                        title="Email Live Preview"
                        srcDoc={previewHtml}
                        className="w-full h-[450px] border-none"
                      />
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Past Broadcast History */}
            <Card className="neu-flat border-none">
              <CardHeader className="flex items-center justify-between">
                <h2 className="font-heading text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Recent Broadcast History
                </h2>
              </CardHeader>
              <CardBody>
                {pastBroadcasts.length === 0 ? (
                  <EmptyState
                    title="No broadcasts sent yet"
                    description="When you dispatch email campaigns, they will be tracked and archived here."
                  />
                ) : (
                  <div className="divide-y divide-black/5 dark:divide-white/5">
                    {pastBroadcasts.map((log) => (
                      <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="space-y-0.5 max-w-lg">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {log.subject}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span className="font-medium text-accent-600 dark:text-accent-400">{log.filterLabel}</span>
                            <span>•</span>
                            <span>{log.totalRecipients} recipients</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="neu-pressed-sm rounded-full px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            {log.sentCount} delivered
                          </span>
                          {log.failedCount > 0 && (
                            <span className="neu-pressed-sm rounded-full px-2.5 py-1 text-[11px] font-bold text-red-500">
                              {log.failedCount} failed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      ) : activeSection === "history" ? (
        /* Delivery History & Recipient Logs Tab */
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <Card className="neu-flat border-none">
            <CardBody className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-accent-500" />
                  Filter Subcampaign:
                </label>
                <select
                  value={historyCategoryFilter}
                  onChange={(e) => setHistoryCategoryFilter(e.target.value)}
                  className="rounded-2xl neu-pressed-sm px-3 py-2 text-xs text-slate-900 dark:text-white bg-inherit border-none focus:outline-none"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                    <option key={key} value={key} className="dark:bg-slate-900">
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search student, email, or subject..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="rounded-full neu-pressed-sm text-xs pl-8 border-none"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleRefreshDeliveryLogs}
                  disabled={loadingLogs}
                  className="neu-btn rounded-full px-3 py-2 text-xs cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${loadingLogs ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Delivery Table */}
          <Card className="neu-flat border-none">
            <CardBody className="p-0 overflow-hidden">
              {loadingLogs ? (
                <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-accent-500" />
                  Loading delivery history...
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="p-12">
                  <EmptyState
                    title="No delivery logs found"
                    description={
                      historyCategoryFilter !== "all" || historySearch
                        ? "No records match your active subcampaign filter or search query."
                        : "When automated lifecycle emails or broadcasts are dispatched, each student recipient is recorded here in real-time."
                    }
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <th className="py-3 px-4">Subcampaign</th>
                        <th className="py-3 px-4">Recipient (Kin ko gyi)</th>
                        <th className="py-3 px-4">Subject & Context</th>
                        <th className="py-3 px-4">Sent At (Kb gyi)</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {filteredLogs.map((log) => {
                        const meta = CATEGORY_LABELS[log.category] || {
                          label: log.campaignLabel || "Automated",
                          badge: "Email",
                          color: "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800",
                        };
                        return (
                          <tr
                            key={log.id}
                            className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors"
                          >
                            <td className="py-3 px-4 shrink-0">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${meta.color}`}
                              >
                                {meta.badge}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {log.recipientName || "Student"}
                              </div>
                              <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                {log.recipientEmail}
                              </div>
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <div className="font-medium text-slate-900 dark:text-white truncate">
                                {log.subject}
                              </div>
                              {log.courseTitle && (
                                <div className="text-[10px] text-accent-600 dark:text-accent-400 font-semibold truncate">
                                  📚 {log.courseTitle}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {formatLogTime(log.sentAt)}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {log.status === "delivered" ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  Delivered
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                  Failed
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setSelectedLogForModal(log)}
                                className="neu-flat-sm px-2.5 py-1 rounded-full text-[11px] font-bold text-accent-600 dark:text-accent-400 hover:text-accent-700 transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View Email
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      ) : (
        /* Compact Lifecycle Automations Directory (13 Workflows) */
        <div className="space-y-4">
          {/* Compact Status & Quick Trigger Strip */}
          <Card className="neu-flat border-none">
            <CardBody className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-900 dark:text-white">Gmail SMTP Connected</span>
                  <span className="text-[11px] text-slate-400 font-mono">(autoaiacademy261@gmail.com)</span>
                </div>
                <div className="text-slate-400 hidden sm:inline">|</div>
                <div className="text-slate-600 dark:text-slate-400">
                  <strong>13 Workflows</strong> Active
                </div>
                <div className="text-slate-400 hidden sm:inline">|</div>
                <div className="text-slate-600 dark:text-slate-400">
                  Hourly Cron Scheduler Active
                </div>
              </div>

              <Button
                type="button"
                onClick={handleRunAutomationChecks}
                disabled={isCheckingAutomation}
                className="neu-btn-primary rounded-full px-4 py-2 text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {isCheckingAutomation ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current" />
                )}
                {isCheckingAutomation ? "Checking..." : "Run Checks Now"}
              </Button>
            </CardBody>
          </Card>

          {/* Results Banner if Run */}
          {automationResults && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Automation Scan Completed at {automationResults.timestamp}
                </div>
                <button
                  onClick={() => setAutomationResults(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-emerald-500/20">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    48h Inactive Signups
                  </div>
                  <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {automationResults.inactiveEmailsSent} emails sent
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-emerald-500/20">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    24h Deadline Alerts
                  </div>
                  <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {automationResults.deadlineRemindersSent} emails sent
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-emerald-500/20">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    Missed Deadline Follow-ups
                  </div>
                  <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {automationResults.missedDeadlineEmailsSent} emails sent
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Compact, clean list of 13 lifecycles */}
          <Card className="neu-flat border-none">
            <CardHeader className="py-3 px-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Automated Lifecycle Directory (13 Workflows)
              </h3>
              <span className="text-[11px] text-slate-400">Click inspect to view template copy</span>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-black/5 dark:divide-white/5 text-xs">
                {AUTOMATED_FLOWS.map((flow) => (
                  <div
                    key={flow.id}
                    className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            flow.triggerType === "Instant (Event)"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : flow.triggerType === "Scheduled (Cron)"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                          }`}
                        >
                          {flow.triggerType}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {flow.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-2">
                        <span><strong>Trigger:</strong> {flow.triggerDescription}</span>
                        <span>•</span>
                        <span><strong>Target:</strong> {flow.targetAudience}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTemplateForModal(flow)}
                        className="neu-flat-sm px-3 py-1.5 rounded-full text-xs font-bold text-accent-600 dark:text-accent-400 hover:text-accent-700 transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <FileText className="h-3 w-3" />
                        Inspect Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* View Selected Recipients Modal */}
      <Modal
        open={viewRecipientsOpen}
        onClose={() => setViewRecipientsOpen(false)}
        title={`Selected Recipients (${targetRecipients.length})`}
      >
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Search student by name or email..."
            value={recipientSearch}
            onChange={(e) => setRecipientSearch(e.target.value)}
            className="rounded-full neu-pressed-sm text-xs"
          />

          <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {targetRecipients
              .filter(
                (r) =>
                  r.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
                  r.email.toLowerCase().includes(recipientSearch.toLowerCase())
              )
              .map((r) => {
                const enrolled = enrollmentsByUser.get(r.uid) || [];
                return (
                  <div
                    key={r.uid}
                    className="p-2.5 rounded-xl neu-flat-sm text-xs flex items-center justify-between gap-3 border border-black/5 dark:border-white/5"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{r.name}</div>
                      <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{r.email}</div>
                    </div>
                    <span className="neu-pressed-sm px-2 py-0.5 rounded-full text-[10px] font-semibold text-accent-500">
                      {enrolled.length} course{enrolled.length === 1 ? "" : "s"}
                    </span>
                  </div>
                );
              })}
          </div>

          <div className="text-right pt-2 border-t border-black/5 dark:border-white/5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setViewRecipientsOpen(false)}
              className="rounded-full neu-btn px-4 text-xs font-semibold cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Send Test Email Modal */}
      <Modal
        open={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        title="Send Test Email Preview"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Enter an email address where you would like to receive a real test copy of this email to verify how it looks in your inbox.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Your Email Address:
            </label>
            <Input
              type="email"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              placeholder="e.g. admin@gmail.com"
              className="rounded-2xl neu-pressed-sm text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setTestModalOpen(false)}
              className="rounded-full neu-btn text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendTest}
              disabled={isSendingTest || !testEmailAddress}
              className="neu-btn-primary rounded-full text-xs font-semibold flex items-center gap-1.5"
            >
              {isSendingTest && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              Send Test Email
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal Before Full Broadcast */}
      <Modal
        open={confirmSendOpen}
        onClose={() => setConfirmSendOpen(false)}
        title="Confirm Email Broadcast Dispatch"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
            ⚠️ <strong>Ready to send:</strong> This will send real individual emails to{" "}
            <strong>{targetRecipients.length} students</strong> via your configured SMTP server.
          </div>

          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <div>
              <span className="text-slate-400">Subject:</span> <strong>{subject}</strong>
            </div>
            <div>
              <span className="text-slate-400">Audience:</span>{" "}
              <strong>
                {filterType === "course" ? `Course: ${selectedCourseTitle}` : filterType}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">Total Count:</span>{" "}
              <strong>{targetRecipients.length} recipients</strong>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5 dark:border-white/5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmSendOpen(false)}
              className="rounded-full neu-btn text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendBroadcast}
              disabled={isSending}
              className="neu-btn-primary rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5"
            >
              {isSending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              Confirm & Send Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delivered Email Inspection Modal */}
      <Modal
        open={Boolean(selectedLogForModal)}
        onClose={() => setSelectedLogForModal(null)}
        title="Delivered Email Inspection"
      >
        {selectedLogForModal && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl neu-pressed-sm bg-black/5 dark:bg-white/5 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Subcampaign:</span>
                <span className="font-bold text-accent-600 dark:text-accent-400">
                  {CATEGORY_LABELS[selectedLogForModal.category]?.label || selectedLogForModal.campaignLabel}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Recipient (Kin ko gyi):</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedLogForModal.recipientName} ({selectedLogForModal.recipientEmail})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Sent At (Kb gyi):</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {formatLogTime(selectedLogForModal.sentAt)}
                </span>
              </div>
              {selectedLogForModal.courseTitle && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Course:</span>
                  <span className="text-slate-700 dark:text-slate-300">{selectedLogForModal.courseTitle}</span>
                </div>
              )}
              <div className="pt-1.5 border-t border-black/5 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Subject: </span>
                <strong className="text-slate-900 dark:text-white">{selectedLogForModal.subject}</strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Content:
              </label>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white overflow-hidden max-h-96 overflow-y-auto">
                {selectedLogForModal.bodyContent ? (
                  <iframe
                    title="Delivered Email Content"
                    srcDoc={selectedLogForModal.bodyContent}
                    className="w-full h-80 border-none"
                  />
                ) : (
                  <div className="p-4 text-xs text-slate-700 whitespace-pre-wrap font-sans">
                    {selectedLogForModal.previewSnippet || "No preview content available."}
                  </div>
                )}
              </div>
            </div>

            <div className="text-right pt-2 border-t border-black/5 dark:border-white/5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setSelectedLogForModal(null)}
                className="rounded-full neu-btn px-4 text-xs font-semibold cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Subcampaign Template Inspection Modal */}
      <Modal
        open={Boolean(selectedTemplateForModal)}
        onClose={() => setSelectedTemplateForModal(null)}
        title={selectedTemplateForModal?.title || "Subcampaign Template"}
      >
        {selectedTemplateForModal && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl neu-pressed-sm bg-black/5 dark:bg-white/5 space-y-1.5">
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Trigger Event: </span>
                <span className="text-slate-900 dark:text-white">{selectedTemplateForModal.triggerDescription}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Target Audience: </span>
                <span className="text-slate-900 dark:text-white">{selectedTemplateForModal.targetAudience}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Sample Subject: </span>
                <strong className="text-accent-600 dark:text-accent-400">&quot;{selectedTemplateForModal.sampleSubject}&quot;</strong>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Email Content Highlights:
              </span>
              <ul className="space-y-1.5 pl-1">
                {selectedTemplateForModal.keyFeatures.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                    <Check className="h-4 w-4 text-accent-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-right pt-3 border-t border-black/5 dark:border-white/5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setSelectedTemplateForModal(null)}
                className="rounded-full neu-btn px-4 text-xs font-semibold cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
