"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/Button";
import { TutorMascotSVG } from "./TutorMascotSVG";
import { useAuth } from "@/hooks/useAuth";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useCourses } from "@/hooks/useCourses";
import { useAssignments } from "@/hooks/useAssignments";
import { fetchAllUsers } from "@/lib/services/users";
import { fetchAllEnrollments } from "@/lib/services/enrollments";
import { fetchAllSubmissions } from "@/lib/services/submissions";
import { fetchAllAssignments } from "@/lib/services/assignments";
import { cn } from "@/lib/utils/cn";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const GREETED_KEY = "aaa-tutor-greeted";

export function FloatingAITutor() {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSpeech, setShowSpeech] = useState(false);

  // Defer heavy data fetching until the user actually opens the AI Tutor
  const { courseIds } = useEnrollments(isOpen ? user?.uid : undefined);
  const { courses } = useCourses(isOpen ? undefined : 0);
  const { assignments } = useAssignments(isOpen ? courseIds : []);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const studentFirstName = (profile?.name || (user as any)?.displayName || "").split(" ")[0];

  const getInitialGreeting = useCallback(() => {
    if (isAdmin) {
      return `Salam ${studentFirstName || "Admin"}! ⚡ I am your Admin AI Co-Pilot. I have live access to platform intelligence: ask me how many students are on the platform, running vs coming soon courses, course enrollments, active vs passed assignments, recent student submissions to grade, or any platform operations!`;
    }
    if (user) {
      return `Hi ${studentFirstName || "there"}! 🎓 I'm your Auto AI Academy Study Tutor. Need help understanding any course concept, coding topic, or guidance on your assignments? Ask me anything!`;
    }
    return "Hi! 👋 I'm the Auto AI Academy Assistant. Have any questions about our 100% free courses, curriculum, or how to get started?";
  }, [isAdmin, user, studentFirstName]);

  // Update greeting dynamically based on auth state, only if chat hasn't started
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length > 1) return prev;
      return [{ role: "assistant", content: getInitialGreeting() }];
    });
  }, [getInitialGreeting]);

  // Greet first-time visitors briefly, then stay out of the way on later visits
  useEffect(() => {
    try {
      if (localStorage.getItem(GREETED_KEY)) return;
    } catch {
      return; // Storage unavailable: skip the greeting rather than repeat it every page.
    }
    const show = setTimeout(() => {
      setShowSpeech(true);
      localStorage.setItem(GREETED_KEY, "1");
    }, 1500);
    const hide = setTimeout(() => setShowSpeech(false), 7500);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  // Handle scroll detection to display scroll-to-bottom button
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 80;
    setShowScrollBottom(isUp);
  };

  // Auto scroll to bottom of chat smoothly
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping, isOpen, isExpanded]);

  const executeChat = useCallback(async (promptText: string) => {
    if (!promptText.trim() || isTyping) return;

    const userMessage: Message = { role: "user", content: promptText.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setShowScrollBottom(false);

    const isRegistered = !!user;
    const studentName = profile?.name || (user as any)?.displayName || null;

    const studentContext = isRegistered && !isAdmin
      ? {
          enrolledCourses: courses
            .filter((c) => courseIds.includes(c.id))
            .map((c) => ({ id: c.id, title: c.title })),
          activeAssignments: assignments.map((a) => {
            const course = courses.find((c) => c.id === a.courseId);
            return {
              id: a.id,
              title: a.title,
              courseId: a.courseId,
              courseTitle: course?.title || a.courseId,
              description: a.description,
              deliverables: a.deliverables,
              dueDate: a.dueDate
                ? new Date(
                    typeof (a.dueDate as any)?.toDate === "function"
                      ? (a.dueDate as any).toDate()
                      : a.dueDate
                  ).toLocaleDateString()
                : undefined,
            };
          }),
        }
      : undefined;

    let adminIntelligenceData: any = undefined;
    if (isAdmin) {
      try {
        const [rawUsers, rawEnrollments, rawSubmissions, rawAssignments] =
          await Promise.all([
            fetchAllUsers(),
            fetchAllEnrollments(),
            fetchAllSubmissions(),
            fetchAllAssignments(),
          ]);

        adminIntelligenceData = {
          users: rawUsers.map((u) => ({
            uid: u.uid,
            name: u.name,
            email: u.email,
            role: u.role,
            allTimeStars: u.allTimeStars || 0,
            allTimeSubmissionCount: u.allTimeSubmissionCount || 0,
            createdAt: u.createdAt
              ? typeof (u.createdAt as any)?.toDate === "function"
                ? (u.createdAt as any).toDate().toISOString()
                : String(u.createdAt)
              : undefined,
          })),
          courses: courses.map((c) => ({
            id: c.id,
            title: c.title,
            status: c.status,
            level: c.level || "All",
            duration: c.duration || "Self-paced",
            lessonCount: c.lessonCount,
          })),
          enrollments: rawEnrollments.map((e) => ({
            courseId: e.courseId,
            userId: e.userId,
          })),
          assignments: rawAssignments.map((a) => ({
            id: a.id,
            courseId: a.courseId,
            title: a.title,
            dueDateMillis:
              typeof (a.dueDate as any)?.toMillis === "function"
                ? (a.dueDate as any).toMillis()
                : new Date(a.dueDate as any).getTime(),
            deliverables: a.deliverables || [],
            description: a.description || "",
          })),
          submissions: rawSubmissions.map((s) => ({
            id: s.id,
            assignmentId: s.assignmentId,
            userId: s.userId,
            studentName: s.studentName,
            submittedAtMillis:
              typeof (s.submittedAt as any)?.toMillis === "function"
                ? (s.submittedAt as any).toMillis()
                : new Date(s.submittedAt as any).getTime(),
            isLate: !!s.isLate,
            isGraded: !!s.grading,
            finalStars: s.grading?.finalStars,
            correctness: s.grading?.correctness,
            creativity: s.grading?.creativity,
            timeliness: s.grading?.timeliness,
            driveLink: s.driveLink || "",
            description: s.description || "",
          })),
        };
      } catch (err) {
        console.error("Error gathering client admin intelligence:", err);
      }
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userName: studentName,
          userId: user?.uid || null,
          isAdmin,
          isRegistered,
          enrolledCourseIds: courseIds,
          studentContext,
          adminIntelligenceData,
        }),
      });

      if (res.status === 429) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "You're sending messages too fast! Please wait a moment before sending more.",
          },
        ]);
        return;
      }

      const data = await res.json();

      if (data.role && data.content) {
        setMessages((prev) => [...prev, data]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, messages, user, profile, isAdmin, courses, courseIds, assignments]);

  // Keep a ref to executeChat for external custom events
  const executeChatRef = useRef(executeChat);
  useEffect(() => {
    executeChatRef.current = executeChat;
  }, [executeChat]);

  // Global event listener to open AI Assistant from anywhere (e.g. Admin Dashboard)
  useEffect(() => {
    const handleOpenAi = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.prompt) {
        void executeChatRef.current(customEvent.detail.prompt);
      }
    };

    window.addEventListener("open-ai-tutor", handleOpenAi);
    return () => {
      window.removeEventListener("open-ai-tutor", handleOpenAi);
    };
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeChat(input);
  };

  const resetChat = () => {
    setMessages([{ role: "assistant", content: getInitialGreeting() }]);
    setInput("");
  };

  const quickSuggestions = isAdmin
    ? [
        { label: "👥 Platform Students Count", prompt: "Platform par is waqt kul kitny students registered hain?" },
        { label: "📚 Active vs Coming Soon Courses", prompt: "Is waqt kitny courses chal rahy hain aur kitny coming soon hain?" },
        { label: "📝 Active vs Passed Assignments", prompt: "Kon kon si assignments is waqt chal rahi hain aur kon si guzar gayin?" },
        { label: "📥 Recent Submissions to Grade", prompt: "Is waqt kis kis student ki assignment submission aayi hui hai?" },
        { label: "🎯 Course Enrollment Breakdown", prompt: "Har course me kitny kitny students enrolled hain?" },
        { label: "🛠️ How to Grade Submissions", prompt: "Student submissions ko grade karne ka kya procedure hai?" },
      ]
    : user
    ? [
        { label: "💡 Explain Course Concept", prompt: "Mujhe Python functions aur loops ka concept simple words me smjha den." },
        { label: "📝 Assignment Help", prompt: "Mujhe assignment samajh nahi aa rahi, kya aap step-by-step explain kr sakte hain?" },
        { label: "📤 How to Submit Work", prompt: "Google Drive se assignment submit krnay ka step-by-step tareeqa kya hai?" },
        { label: "⭐ How to Get 5 Stars", prompt: "Assignments me 5 stars lene ke liye grading criteria kya hai?" },
      ]
    : [
        { label: "🎓 Are courses free?", prompt: "Kya Auto AI Academy ke tamam courses 100% free hain?" },
        { label: "🚀 How to Enroll?", prompt: "Courses me enroll hone ka tareeqa kya hai?" },
        { label: "📜 Certificate Criteria", prompt: "Course complete kr k verified certificate kaise milta hai?" },
        { label: "📚 Available Courses", prompt: "Auto AI Academy par kon kon se courses available hain?" },
      ];

  return (
    <div className="fixed bottom-4 right-3 z-50 flex max-h-[calc(100dvh-1rem)] flex-col items-end sm:bottom-6 sm:right-6 md:right-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "mb-3 flex flex-col overflow-hidden rounded-3xl neu-flat-lg transition-all duration-300",
              isExpanded
                ? "w-[calc(100vw-1.5rem)] sm:w-[680px] md:w-[780px] lg:w-[840px] max-w-4xl h-[min(620px,calc(100dvh-6.5rem))]"
                : "w-[calc(100vw-1.5rem)] sm:w-96 h-[min(510px,calc(100dvh-6.5rem))]"
            )}
          >
            {/* Pinned Top Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-black/5 dark:border-white/5 px-4 py-3 sm:px-5 sm:py-3.5 bg-inherit select-none">
              <div className="flex items-center gap-2.5">
                <div className="neu-pressed relative h-9 w-9 overflow-hidden rounded-full p-0.5">
                  <TutorMascotSVG className="h-full w-full object-cover p-1" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {isAdmin ? "Admin AI Co-Pilot" : user ? "AI Study Tutor" : "Academy Assistant"}
                  </h3>
                  {isAdmin ? (
                    <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
                      ⚡ Executive Admin Mode
                    </span>
                  ) : user ? (
                    <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      🎓 Student Tutor Mode
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      Online
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Reset / New Chat */}
                <button
                  type="button"
                  onClick={resetChat}
                  aria-label="New chat"
                  title="Start fresh conversation"
                  className="neu-pressed-sm rounded-full p-1.5 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                {/* Expand / Minimize */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  aria-label={isExpanded ? "Restore normal size" : "Expand chat window"}
                  title={isExpanded ? "Restore normal size" : "Expand chat window"}
                  className="neu-pressed-sm rounded-full p-1.5 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {isExpanded ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M14 4h6m-6 0v6m6-6l-7 7M10 4H4m0 0v6m0-6l7 7" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6m0 0v6m0-6L14 10M9 21H3m0 0v-6m0 6l7-7M21 15v6m0 0h-6m6 0l-7-7M3 9V3m0 0h6M3 3l7 7" />
                    </svg>
                  )}
                </button>
                {/* Close */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  title="Close chat"
                  className="neu-pressed-sm rounded-full p-1.5 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-4 w-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Body & Scrollable Area */}
            <div className="flex flex-1 min-h-0 flex-col p-3 sm:p-4 overflow-hidden relative">
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 min-h-0 space-y-4 overflow-y-auto overscroll-contain pr-1.5 sm:pr-2 custom-scrollbar focus:outline-none"
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex w-full ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={cn(
                        "break-words rounded-2xl p-3 text-sm transition-all",
                        isExpanded ? "max-w-[90%]" : "max-w-[85%]",
                        msg.role === "user"
                          ? "rounded-tr-sm neu-btn-primary"
                          : "rounded-tl-sm neu-pressed-sm text-slate-800 dark:text-slate-200"
                      )}
                    >
                      {msg.role === "user" ? (
                        <p className="whitespace-pre-wrap leading-snug text-white">{msg.content}</p>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-snug prose-pre:bg-slate-900 prose-pre:text-slate-50">
                          <ReactMarkdown>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Quick suggestions when chat is starting */}
                {messages.length <= 1 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                      {isAdmin ? "⚡ Admin Intelligence Actions:" : user ? "Quick Study Help:" : "Suggested Questions:"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {quickSuggestions.map((item, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => executeChat(item.prompt)}
                          className={cn(
                            "neu-flat-sm text-[11px] px-2.5 py-1.5 rounded-full transition-all cursor-pointer font-medium text-left border",
                            isAdmin
                              ? "text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 bg-amber-500/10 border-amber-500/20 hover:scale-[1.02]"
                              : "text-slate-700 dark:text-slate-200 hover:text-accent-600 dark:hover:text-accent-400 bg-white/60 dark:bg-slate-800/60 border-black/5 dark:border-white/5 hover:scale-[1.02]"
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isTyping && (
                  <div className="flex w-full justify-start">
                    <div className="flex gap-1 rounded-2xl rounded-tl-sm neu-pressed-sm px-4 py-3">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Scroll to bottom button if user scrolled up */}
              {showScrollBottom && (
                <button
                  type="button"
                  onClick={() => {
                    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
                    setShowScrollBottom(false);
                  }}
                  className="absolute bottom-16 right-6 neu-flat-sm rounded-full px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 shadow-lg hover:scale-105 transition-transform cursor-pointer z-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-black/10 dark:border-white/10"
                >
                  <span>↓ Jump to latest</span>
                </button>
              )}

              {/* Pinned Bottom Input Form */}
              <form onSubmit={sendMessage} className="mt-3 shrink-0 flex gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isAdmin
                      ? "Ask admin queries (students count, active courses, submissions)..."
                      : user
                      ? "Ask about course concepts, code, or assignments..."
                      : "Ask me anything about Auto AI Academy..."
                  }
                  className="w-full rounded-full neu-pressed-sm px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500 border-none"
                />
                <Button
                  type="submit"
                  size="sm"
                  className={cn(
                    "rounded-full px-4",
                    isAdmin ? "neu-btn-primary bg-gradient-to-r from-amber-600 to-amber-700" : "neu-btn-primary"
                  )}
                  disabled={isTyping || !input.trim()}
                >
                  Send
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-end justify-end gap-3">
        {/* Speech Bubble */}
        <AnimatePresence>
          {!isOpen && showSpeech && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 10 }}
              className="relative mb-4 hidden rounded-2xl rounded-br-none neu-flat px-4 py-3 sm:block"
            >
              <p className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                Salam {studentFirstName || (isAdmin ? "Admin" : "there")}! <br />
                <span className={isAdmin ? "text-amber-500" : "text-accent-500"}>
                  {isAdmin ? "Admin AI Co-Pilot ⚡" : user ? "Need study help? 📚" : "Need help? 🚀"}
                </span>
              </p>
              {/* Little triangle for the speech bubble */}
              <div className="absolute -bottom-2 right-0 h-4 w-4 border-l-8 border-t-8 border-transparent border-t-[#e8ecf4] dark:border-t-[#10131d]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mascot Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isAdmin ? "Admin AI Co-Pilot" : "AI tutor chat"}
          className={cn(
            "neu-btn group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full transition-transform hover:scale-105 active:scale-95 sm:h-16 sm:w-16",
            isAdmin && "ring-2 ring-amber-500/50"
          )}
        >
          <TutorMascotSVG className="h-full w-full object-cover p-1.5" />
        </button>
      </div>
    </div>
  );
}
