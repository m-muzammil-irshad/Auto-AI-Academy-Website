"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MousePointerClick,
  PlayCircle,
  UploadCloud,
  Trophy,
  CheckCircle2,
  ArrowRight,
  Star,
  ExternalLink,
  ShieldCheck,
  Code2,
  Play,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  Award,
  Flame,
  FileCheck2,
  ChevronDown,
  HelpCircle,
  Layers,
  GraduationCap,
  Eye,
  Globe2,
} from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const STEP_ANCHORS = [
  { id: "step-1", stepNum: "01", title: "Enroll in a Click", icon: MousePointerClick, color: "from-blue-500 to-cyan-400" },
  { id: "step-2", stepNum: "02", title: "Learn & Practice", icon: PlayCircle, color: "from-purple-500 to-pink-500" },
  { id: "step-3", stepNum: "03", title: "Submit Assignments", icon: UploadCloud, color: "from-accent-500 to-indigo-500" },
  { id: "step-4", stepNum: "04", title: "Rank & Certify", icon: Trophy, color: "from-amber-400 to-orange-500" },
];

export function HowItWorksGuide() {
  // Interactive Step 1 simulator state
  const [enrolled, setEnrolled] = useState(false);

  // Interactive Step 2 code sandbox state
  const [activeCodeTab, setActiveCodeTab] = useState<"agent" | "tools">("agent");
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState<string | null>(null);

  // Interactive Step 3 submission link state
  const [submitted, setSubmitted] = useState(false);
  const [driveUrl, setDriveUrl] = useState("https://drive.google.com/file/d/1X8p_auto_ai_agent/view?usp=sharing");
  const [copiedLink, setCopiedLink] = useState(false);

  // Interactive FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSimulateRunCode = () => {
    setIsRunningCode(true);
    setCodeOutput(null);
    setTimeout(() => {
      setIsRunningCode(false);
      setCodeOutput(
        "[AI Agent Kernel]: Initializing Gemini-1.5-Pro...\n[Tool Call]: WebSearchTool('Pakistani AI Market Trends 2026')\n[Result]: 4 relevant sources fetched in 0.8s.\n[Synthesis]: 'Enterprise AI automation in South Asia surged by 140% in 2026...'\n✓ Task Completed successfully! (Tokens: 382 | Latency: 1.1s)"
      );
    }, 1200);
  };

  const handleCopySampleLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const scrollToStep = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="relative z-10 py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ===================== HERO SECTION ===================== */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-3xl text-center mb-16 sm:mb-24"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-slate-200/80 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            <span>Learning blueprint</span>
          </div>

          <h1 className="font-heading text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Four steps to mastery
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            Discover how Auto AI Academy takes you from zero programming experience to creating production-grade AI agents, receiving 5-star peer and mentor evaluations, and unlocking globally shareable credentials.
          </p>

          {/* Quick-Jump Tactile Anchor Dock */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {STEP_ANCHORS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToStep(s.id)}
                className="rounded-lg border border-slate-200/80 bg-white px-4 py-2 flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group"
              >
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {s.stepNum}
                </span>
                <span>{s.title}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* ===================== STEP 01: ENROLL IN A CLICK ===================== */}
        <section id="step-1" className="scroll-mt-28 mb-28 lg:mb-36">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            
            {/* Left Content */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="lg:col-span-6 space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-md border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-mono text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                <MousePointerClick className="h-3.5 w-3.5 text-accent-500" />
                <span>01</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 dark:text-white leading-tight">
                Enroll in a click. Zero paywalls, zero hassle.
              </h2>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Traditional platforms trap you behind credit card paywalls, 7-day trials, or complicated checkout funnels. At Auto AI Academy, learning is genuinely free for everyone.
              </p>

              <div className="space-y-4 pt-2">
                <div className="neu-flat-sm rounded-2xl p-4 flex items-start gap-4">
                  <div className="neu-pressed rounded-xl p-2.5 text-blue-600 dark:text-blue-400 shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">10-Second Google or Email Auth</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      No billing forms or card details. One click securely provisions your personal student workspace.
                    </p>
                  </div>
                </div>

                <div className="neu-flat-sm rounded-2xl p-4 flex items-start gap-4">
                  <div className="neu-pressed rounded-xl p-2.5 text-blue-600 dark:text-blue-400 shrink-0">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Instant LMS & Curriculum Unlock</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      Immediately access course lecture playlists, downloadable code boilerplates, and homework briefs.
                    </p>
                  </div>
                </div>

                <div className="neu-flat-sm rounded-2xl p-4 flex items-start gap-4">
                  <div className="neu-pressed rounded-xl p-2.5 text-blue-600 dark:text-blue-400 shrink-0">
                    <Globe2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Community Cohort Integration</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      Get auto-enrolled into our student discussion channels for peer assistance and live mentorship.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/courses"
                  className="neu-btn inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-blue-600 dark:text-blue-400 hover:scale-[1.02] transition-transform"
                >
                  <span>Browse Free Courses Catalog</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            {/* Right Interactive Visual Simulation */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="lg:col-span-6"
            >
              <div className="neu-flat-lg rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                <div className="flex items-center justify-between pb-6 border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="neu-pressed rounded-xl h-10 w-10 flex items-center justify-center text-blue-500 font-black">
                      1
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Live Simulation</div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">Instant 1-Click Enrollment</div>
                    </div>
                  </div>
                  <div className="neu-pressed-sm rounded-full px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Free Access</span>
                  </div>
                </div>

                {/* Simulated Course Card */}
                <div className="mt-6 neu-pressed rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        Agentic AI Track
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg mt-2">
                        Autonomous AI Agents & n8n Masterclass
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Instructor: Muzammil Irshad • 18 Video Lessons • 3 Hands-on Projects
                      </p>
                    </div>
                    <div className="neu-flat-sm rounded-xl px-3 py-1.5 text-center shrink-0">
                      <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Fee</div>
                      <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm">0 PKR</div>
                    </div>
                  </div>

                  {/* Student Status indicator */}
                  <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Student Portal Status:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {enrolled ? "Enrolled & Active" : "Not Enrolled"}
                    </span>
                  </div>

                  {/* Interactive Button */}
                  <button
                    onClick={() => setEnrolled(!enrolled)}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                      enrolled
                        ? "neu-pressed bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "neu-btn text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95"
                    }`}
                  >
                    {enrolled ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Enrolled! Workspace Ready (Click to reset demo)</span>
                      </>
                    ) : (
                      <>
                        <MousePointerClick className="h-4 w-4" />
                        <span>⚡ Try 1-Click Enrollment Simulator</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Features Checklist */}
                <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>No Credit Card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Self-Paced Lifetime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Urdu / Hindi Voice</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Free Certificate</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ===================== STEP 02: LEARN & PRACTICE ===================== */}
        <section id="step-2" className="scroll-mt-28 mb-28 lg:mb-36">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            
            {/* Left Interactive Video & Code Sandbox Simulation */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="lg:col-span-7 order-2 lg:order-1"
            >
              <div className="neu-flat-lg rounded-3xl p-6 sm:p-8 space-y-6">
                
                {/* Simulated Video Player UI */}
                <div className="neu-pressed rounded-2xl p-4 sm:p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="neu-pressed-sm rounded-full px-2.5 py-0.5 font-bold text-purple-600 dark:text-purple-400">
                        Urdu Audio
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">1080p HD</span>
                    </div>
                    <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">09:42 / 16:15</span>
                  </div>

                  <div className="aspect-video rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent pointer-events-none" />
                    <div className="neu-pressed rounded-full p-4 text-purple-400 mb-3 hover:scale-110 transition-transform cursor-pointer">
                      <Play className="h-7 w-7 fill-purple-400" />
                    </div>
                    <div className="font-bold text-white text-sm sm:text-base">
                      Lesson 03: Building a Multi-Tool Agent with LangChain & Gemini
                    </div>
                    <div className="text-xs text-purple-200/70 mt-1">
                      Urdu Voiceover with English Code Terminology
                    </div>
                  </div>

                  {/* Video Progress Scrubber */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full neu-pressed-sm overflow-hidden">
                      <div className="h-full w-3/5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">60%</span>
                  </div>
                </div>

                {/* Simulated Interactive Code Sandbox */}
                <div className="neu-flat-sm rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-purple-500" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Interactive Practice Sandbox</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setActiveCodeTab("agent")}
                        className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                          activeCodeTab === "agent" ? "neu-pressed text-purple-600 dark:text-purple-400" : "text-slate-500"
                        }`}
                      >
                        agent.py
                      </button>
                      <button
                        onClick={() => setActiveCodeTab("tools")}
                        className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                          activeCodeTab === "tools" ? "neu-pressed text-purple-600 dark:text-purple-400" : "text-slate-500"
                        }`}
                      >
                        tools.py
                      </button>
                    </div>
                  </div>

                  {/* Code View */}
                  <div className="mt-3 bg-slate-950 rounded-xl p-4 font-mono text-[11px] sm:text-xs text-slate-300 leading-relaxed overflow-x-auto shadow-inner">
                    {activeCodeTab === "agent" ? (
                      <pre>
                        <span className="text-purple-400">from</span> langchain_google_genai <span className="text-purple-400">import</span> ChatGoogleGenerativeAI{"\n"}
                        <span className="text-purple-400">from</span> tools <span className="text-purple-400">import</span> WebSearchTool, FileParser{"\n\n"}
                        <span className="text-slate-500"># 1. Initialize Gemini Model with Urdu Context</span>{"\n"}
                        llm = ChatGoogleGenerativeAI(model=<span className="text-emerald-300">&quot;gemini-1.5-pro&quot;</span>, temperature=0.2){"\n"}
                        agent = Agent(llm=llm, tools=[WebSearchTool(), FileParser()]){"\n"}
                        output = agent.execute(<span className="text-emerald-300">&quot;Analyze Pakistani AI market 2026&quot;</span>)
                      </pre>
                    ) : (
                      <pre>
                        <span className="text-purple-400">class</span> <span className="text-cyan-300">WebSearchTool</span>:{"\n"}
                        {"  "}name = <span className="text-emerald-300">&quot;web_search&quot;</span>{"\n"}
                        {"  "}description = <span className="text-emerald-300">&quot;Searches recent live web data&quot;</span>{"\n\n"}
                        {"  "}<span className="text-purple-400">def</span> <span className="text-yellow-300">execute</span>(self, query: str):{"\n"}
                        {"    "}<span className="text-slate-500"># Custom scraper logic</span>{"\n"}
                        {"    "}<span className="text-purple-400">return</span> search_google_serp(query)
                      </pre>
                    )}
                  </div>

                  {/* Run Sandbox Button */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={handleSimulateRunCode}
                      disabled={isRunningCode}
                      className="neu-btn px-4 py-2 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2 cursor-pointer hover:scale-[1.02] transition-transform"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{isRunningCode ? "Running Agent in Sandbox..." : "▶ Run Code in Sandbox"}</span>
                    </button>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      ⚡ 0 Local Setup Needed
                    </div>
                  </div>

                  {/* Output Terminal */}
                  {codeOutput && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 neu-pressed rounded-xl p-3 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap leading-relaxed"
                    >
                      {codeOutput}
                    </motion.div>
                  )}
                </div>

              </div>
            </motion.div>

            {/* Right Content */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="lg:col-span-5 space-y-6 order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 rounded-md border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-mono text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                <PlayCircle className="h-3.5 w-3.5 text-accent-500" />
                <span>02</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 dark:text-white leading-tight">
                Learn and practice with bite-sized Urdu tutorials.
              </h2>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                No 4-hour monotone lectures full of unnecessary jargon. We teach real-world generative AI and automation using punchy 10 to 15 minute practical lessons in clear, native Urdu/Hindi.
              </p>

              <div className="space-y-4 pt-2">
                <div className="neu-flat-sm rounded-2xl p-4 flex items-start gap-4">
                  <div className="neu-pressed rounded-xl p-2.5 text-purple-600 dark:text-purple-400 shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Bilingual Pedagogy</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      Complex concepts like Vector Embeddings, RAG, and Agent Tools explained in Urdu, while keeping Python code industry-standard.
                    </p>
                  </div>
                </div>

                <div className="neu-flat-sm rounded-2xl p-4 flex items-start gap-4">
                  <div className="neu-pressed rounded-xl p-2.5 text-purple-600 dark:text-purple-400 shrink-0">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Real Production Projects</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      You won&apos;t just print &quot;Hello World&quot;. You build autonomous agents, n8n WhatsApp bots, and web scrapers from day one.
                    </p>
                  </div>
                </div>

                <div className="neu-flat-sm rounded-2xl p-4 flex items-start gap-4">
                  <div className="neu-pressed rounded-xl p-2.5 text-purple-600 dark:text-purple-400 shrink-0">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">In-Lesson AI Q&A Assistant</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      Stuck on a syntax error? Our embedded AI Tutor inspects your code traceback and resolves doubts instantly.
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>

          </div>
        </section>

        {/* ===================== STEP 03: SUBMIT ASSIGNMENTS ===================== */}
        <section id="step-3" className="scroll-mt-28 mb-28 lg:mb-36">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            
            {/* Left Content */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="lg:col-span-6 space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-md border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-mono text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                <UploadCloud className="h-3.5 w-3.5 text-accent-500" />
                <span>03</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 dark:text-white leading-tight">
                Submit assignments. Rigorous 5-star peer and mentor rubric.
              </h2>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Watching videos doesn&apos;t make you an engineer — building and shipping code does. Submit your Google Drive or GitHub link, and get graded on 3 strict academic dimensions.
              </p>

              {/* 3-Tier Rubric Visual Breakdown */}
              <div className="space-y-4 pt-2">
                <div className="neu-flat-sm rounded-2xl p-4 border-l-4 border-accent-500">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      1. Functional Correctness (40%)
                    </h4>
                    <span className="neu-pressed-sm rounded-full px-2 py-0.5 text-xs font-bold text-accent-600 dark:text-accent-400">
                      Weight: 40%
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Does your agent execute tools without unhandled exceptions? Does it satisfy all project acceptance criteria?
                  </p>
                </div>

                <div className="neu-flat-sm rounded-2xl p-4 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      2. Code Cleanliness & Architecture (40%)
                    </h4>
                    <span className="neu-pressed-sm rounded-full px-2 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                      Weight: 40%
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Clean modular functions, PEP 8 styling, error handlers, and readable inline comments.
                  </p>
                </div>

                <div className="neu-flat-sm rounded-2xl p-4 border-l-4 border-amber-500">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      3. Innovation & Timeliness (20%)
                    </h4>
                    <span className="neu-pressed-sm rounded-full px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      Weight: 20%
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Submitting before the deadline + extra credit features like streaming tokens or UI integration.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Interactive Submission Simulator */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="lg:col-span-6 space-y-6"
            >
              <div className="neu-flat-lg rounded-3xl p-6 sm:p-8 space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="neu-pressed rounded-xl h-10 w-10 flex items-center justify-center text-accent-500 font-black">
                      3
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Assignment Portal</div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">CapStone 02: WhatsApp Customer Agent</div>
                    </div>
                  </div>
                  <span className="neu-pressed-sm rounded-full px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Active Module
                  </span>
                </div>

                {/* Important Google Drive Permission Warning Box */}
                <div className="neu-pressed rounded-2xl p-4 bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-amber-800 dark:text-amber-300 text-xs sm:text-sm">
                        Important Google Drive Permission Rule
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        When uploading your zipped code or docs to Google Drive, remember to click <strong className="text-slate-900 dark:text-white">Share → &quot;Anyone with the link can view&quot;</strong>. If the link is private, instructors cannot evaluate your code.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simulated URL Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Google Drive / GitHub Solution Link:</span>
                    <button
                      onClick={handleCopySampleLink}
                      className="text-accent-600 dark:text-accent-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedLink ? "Sample Copied!" : "Use Sample Link"}</span>
                    </button>
                  </label>
                  <div className="neu-pressed rounded-xl p-3 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-slate-400 shrink-0" />
                    <input
                      type="url"
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      className="bg-transparent w-full text-xs sm:text-sm text-slate-800 dark:text-slate-200 outline-none font-mono"
                      placeholder="https://drive.google.com/file/d/..."
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  onClick={() => setSubmitted(!submitted)}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                    submitted
                      ? "neu-pressed bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                      : "neu-btn text-white bg-gradient-to-r from-accent-600 to-indigo-500 hover:opacity-95"
                  }`}
                >
                  {submitted ? (
                    <>
                      <FileCheck2 className="h-4 w-4" />
                      <span>Assignment Submitted! Under Review (Click to Reset)</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      <span>Turn In Assignment for Grading</span>
                    </>
                  )}
                </button>

                {/* Simulated Mentor Grading Review Card */}
                <div className="neu-pressed rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="neu-flat-sm rounded-lg h-7 w-7 flex items-center justify-center text-xs font-bold text-accent-500">
                        M
                      </div>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Instructor Evaluation Preview</span>
                    </div>
                    {/* Stars */}
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((st) => (
                        <Star key={st} className="h-3.5 w-3.5 fill-amber-400" />
                      ))}
                      <span className="text-xs font-black text-slate-900 dark:text-white ml-1">5.0 / 5.0</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-black/5 dark:bg-white/5 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                    &quot;Exceptional work handling tool exceptions when the API rates throttle. Clean code structure with proper docstrings. Approved for certification.&quot;
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>Reviewed by Lead AI Mentor</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Passed with Distinction</span>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </section>

        {/* ===================== STEP 04: RANK & CERTIFY ===================== */}
        <section id="step-4" className="scroll-mt-28 mb-28 lg:mb-36">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            
            {/* Left Mockup: Podium & Certificate Preview */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="lg:col-span-7 order-2 lg:order-1 space-y-6"
            >
              <div className="neu-flat-lg rounded-3xl p-6 sm:p-8 space-y-6">
                
                {/* Cohort Leaderboard Podium Preview */}
                <div className="neu-pressed rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Live Cohort Leaderboard
                      </span>
                    </div>
                    <span className="neu-pressed-sm rounded-full px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      Season 04 Active
                    </span>
                  </div>

                  {/* 3 Podium Cards */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {/* Rank 2 */}
                    <div className="neu-flat-sm rounded-2xl p-3 flex flex-col items-center justify-end">
                      <div className="neu-pressed h-10 w-10 rounded-full flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 mb-2">
                        🥈
                      </div>
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate w-full">Ayesha R.</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">1,380 XP</div>
                      <div className="neu-pressed-sm rounded-full px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-2">
                        Rank #2
                      </div>
                    </div>

                    {/* Rank 1 - Champion */}
                    <div className="neu-flat rounded-2xl p-4 flex flex-col items-center justify-end border-2 border-amber-400/30 scale-105">
                      <div className="neu-pressed h-12 w-12 rounded-full flex items-center justify-center font-bold text-amber-500 mb-2 shadow-inner">
                        👑
                      </div>
                      <div className="font-black text-xs text-slate-900 dark:text-white truncate w-full">Hamza K.</div>
                      <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Flame className="h-3 w-3 fill-amber-500" />
                        <span>1,450 XP</span>
                      </div>
                      <div className="neu-pressed-sm rounded-full px-2.5 py-0.5 text-[10px] font-black text-amber-500 mt-2">
                        #1 Champion
                      </div>
                    </div>

                    {/* Rank 3 */}
                    <div className="neu-flat-sm rounded-2xl p-3 flex flex-col items-center justify-end">
                      <div className="neu-pressed h-10 w-10 rounded-full flex items-center justify-center font-bold text-amber-700 dark:text-amber-600 mb-2">
                        🥉
                      </div>
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate w-full">Bilal S.</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">1,290 XP</div>
                      <div className="neu-pressed-sm rounded-full px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-2">
                        Rank #3
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Your Current Standing:</span>
                    <span className="font-bold text-accent-600 dark:text-accent-400">Rank #14 (Top 5% of cohort)</span>
                  </div>
                </div>

                {/* Simulated Certificate Card with QR & Credential ID */}
                <div className="neu-pressed rounded-2xl p-6 relative overflow-hidden border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-amber-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                          Auto AI Academy Accredited
                        </span>
                      </div>
                      <h4 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-2">
                        Certificate of AI Engineering Mastery
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Awarded to: <strong className="text-slate-800 dark:text-slate-200">Muhammad Zubair</strong> for completing all capstone assignments with 5.0★ rating.
                      </p>
                    </div>

                    {/* Simulated QR Code Badge */}
                    <div className="neu-flat-sm rounded-xl p-2.5 text-center shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-slate-900 dark:bg-white flex flex-col items-center justify-center p-1">
                        <div className="grid grid-cols-3 gap-0.5 w-full h-full">
                          {[...Array(9)].map((_, i) => (
                            <div key={i} className={`rounded-[1px] ${i % 2 === 0 ? "bg-amber-400" : "bg-transparent"}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 block mt-1">VERIFY QR</span>
                    </div>
                  </div>

                  {/* Verification Credentials Row */}
                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      Credential ID: <strong className="text-slate-800 dark:text-slate-200">AAA-2026-98104</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="neu-pressed-sm rounded-full px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Tamper-Proof</span>
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* Right Content */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="lg:col-span-5 space-y-6 order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 rounded-md border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-mono text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                <Trophy className="h-3.5 w-3.5 text-accent-500" />
                <span>04</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 dark:text-white leading-tight">
                Rank and certify. Global leaderboard and verified credentials.
              </h2>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Stand out in the competitive tech job market. Earning your certificate requires real code verification, making your credential respected by employers and freelance clients alike.
              </p>

              <div className="space-y-4 pt-2">
                <div className="neu-flat-sm rounded-2xl p-4 flex items-start gap-4">
                  <div className="neu-pressed rounded-xl p-2.5 text-amber-600 dark:text-amber-400 shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">1-Click Online Verification URL</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      Anyone can verify your credential authenticity by scanning your QR code or visiting your unique certificate page.
                    </p>
                  </div>
                </div>

                <div className="neu-flat-sm rounded-2xl p-4 flex items-start gap-4">
                  <div className="neu-pressed rounded-xl p-2.5 text-amber-600 dark:text-amber-400 shrink-0">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">LinkedIn Profile Integration</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      Export high-resolution PDFs and publish directly to your LinkedIn &quot;Licenses &amp; Certifications&quot; section.
                    </p>
                  </div>
                </div>

                <div className="neu-flat-sm rounded-2xl p-4 flex items-start gap-4">
                  <div className="neu-pressed rounded-xl p-2.5 text-amber-600 dark:text-amber-400 shrink-0">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Hiring Partner Pipeline</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      Top students on our leaderboard get recommended for paid freelance projects and hiring partner contracts.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ===================== COMPARISON MATRIX ===================== */}
        <section className="mb-28 lg:mb-36">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="mb-4 neu-pressed-sm inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400">
              <span>Why We Are Different</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Auto AI Academy vs Other Learning Methods
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
              See why hundreds of learners transition from unstructured YouTube tutorials and expensive bootcamps to our platform.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="neu-flat-lg rounded-3xl p-4 sm:p-8 overflow-x-auto"
          >
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px]">
                  <th className="py-4 px-3 sm:px-6">Feature</th>
                  <th className="py-4 px-3 sm:px-6 text-accent-600 dark:text-accent-400">Auto AI Academy</th>
                  <th className="py-4 px-3 sm:px-6">YouTube Playlists</th>
                  <th className="py-4 px-3 sm:px-6">Paid Bootcamps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="py-4 px-3 sm:px-6 font-bold text-slate-900 dark:text-white">Course Tuition</td>
                  <td className="py-4 px-3 sm:px-6 font-black text-emerald-600 dark:text-emerald-400">100% Free Forever</td>
                  <td className="py-4 px-3 sm:px-6">Free (with ads)</td>
                  <td className="py-4 px-3 sm:px-6 text-red-500">$300 - $1,500+</td>
                </tr>
                <tr>
                  <td className="py-4 px-3 sm:px-6 font-bold text-slate-900 dark:text-white">Instruction Medium</td>
                  <td className="py-4 px-3 sm:px-6 font-bold text-purple-600 dark:text-purple-400">Native Urdu / Hindi</td>
                  <td className="py-4 px-3 sm:px-6">Fragmented / Outdated</td>
                  <td className="py-4 px-3 sm:px-6">English only</td>
                </tr>
                <tr>
                  <td className="py-4 px-3 sm:px-6 font-bold text-slate-900 dark:text-white">Hands-on Assignment Grading</td>
                  <td className="py-4 px-3 sm:px-6 font-bold text-accent-600 dark:text-accent-400">3-Tier Rubric &amp; 5★ Feedback</td>
                  <td className="py-4 px-3 sm:px-6 text-slate-400">None (Self-study)</td>
                  <td className="py-4 px-3 sm:px-6">Automated MCQ tests</td>
                </tr>
                <tr>
                  <td className="py-4 px-3 sm:px-6 font-bold text-slate-900 dark:text-white">Verifiable QR Certificate</td>
                  <td className="py-4 px-3 sm:px-6 font-bold text-emerald-600 dark:text-emerald-400">Included Free</td>
                  <td className="py-4 px-3 sm:px-6 text-slate-400">No Certificates</td>
                  <td className="py-4 px-3 sm:px-6">Included (After payment)</td>
                </tr>
                <tr>
                  <td className="py-4 px-3 sm:px-6 font-bold text-slate-900 dark:text-white">Gamified Cohort Leaderboard</td>
                  <td className="py-4 px-3 sm:px-6 font-bold text-amber-500">Live Weekly Podium</td>
                  <td className="py-4 px-3 sm:px-6 text-slate-400">None</td>
                  <td className="py-4 px-3 sm:px-6 text-slate-400">Rare</td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </section>

        {/* ===================== FAQ ACCORDION ===================== */}
        <section className="mb-24 lg:mb-32 max-w-4xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="text-center mb-12"
          >
            <div className="mb-3 neu-pressed-sm inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="font-heading text-3xl font-bold text-slate-900 dark:text-white">
              Everything You Need to Know About the Learning Flow
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: "Is everything on Auto AI Academy genuinely 100% free?",
                a: "Yes. All video courses, code repositories, assignment reviews, community discussions, and verified certificates are provided at zero cost. There are no surprise paywalls or hidden trial periods.",
              },
              {
                q: "What should I do if my Google Drive assignment link is marked as restricted?",
                a: "Open your Google Drive file or folder, click 'Share', and change General Access to 'Anyone with the link can view'. If you submit a restricted link, your mentor will leave a note asking you to update permissions and resubmit without penalty.",
              },
              {
                q: "Can I resubmit an assignment if I didn't get 5 stars?",
                a: "Yes! We believe in iterative mastery. Read the mentor's feedback notes, refine your code, and resubmit as many times as needed to earn full marks.",
              },
              {
                q: "Do I need prior Python coding knowledge to enroll?",
                a: "We offer courses starting from Python basics all the way to advanced Agentic LLMs and n8n workflows. Check the prerequisites listed on each course page to pick the right starting point for your skill level.",
              },
            ].map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="neu-flat rounded-2xl overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-sm sm:text-base cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 text-accent-500 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-black/5 dark:border-white/5 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===================== FINAL ACTION CTA ===================== */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="neu-flat-lg rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
        >
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white">
              Ready to start your journey?
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Join thousands of learners building real AI agents and automation systems today. No fees, no hurdles.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/courses"
                className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors"
              >
                Explore free courses
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border border-slate-200/80 bg-white px-6 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Create student account
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
