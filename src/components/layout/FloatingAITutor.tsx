"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/Button";
import { TutorMascotSVG } from "./TutorMascotSVG";
import { useAuth } from "@/hooks/useAuth";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function FloatingAITutor() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showSpeech, setShowSpeech] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);

  // Update greeting dynamically based on auth state, only if chat hasn't started
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length > 1) return prev;
      const greeting = user
        ? `Hi ${(user as any)?.displayName?.split(" ")[0] || (user as any)?.name?.split(" ")[0] || ""}! Need help with your courses or assignments?`
        : "Hi! I'm the Auto AI Academy Assistant. Have any questions about our free courses or how to enroll?";
      return [{ role: "assistant", content: greeting }];
    });
  }, [user]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Delay the speech bubble appearance slightly for a nice entrance effect
  useEffect(() => {
    const timer = setTimeout(() => setShowSpeech(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage], userName: (user as any)?.displayName || (user as any)?.name || null }),
      });
      
      if (res.status === 429) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "You're sending messages too fast! Please wait a minute before sending more." },
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
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end sm:right-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="mb-4 w-80 overflow-hidden rounded-2xl border border-slate-200/50 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/80 sm:w-96"
          >
            <div className="flex items-center justify-between border-b border-slate-200/50 bg-accent-50/50 px-4 py-3 dark:border-slate-700/50 dark:bg-accent-900/20">
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  <TutorMascotSVG className="h-full w-full object-cover p-1" />
                </div>
                <h3 className="font-heading text-sm font-semibold text-slate-900 dark:text-white">
                  AI Assistant
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200/50 hover:text-slate-600 dark:hover:bg-slate-800/50 dark:hover:text-slate-300"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex h-80 flex-col p-4">
              <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pb-2 pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex w-full ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] break-words rounded-2xl p-3 text-sm ${
                        msg.role === "user"
                          ? "rounded-tr-sm bg-accent-600 text-white shadow-md shadow-accent-600/20"
                          : "rounded-tl-sm bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
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
                {isTyping && (
                  <div className="flex w-full justify-start">
                    <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 dark:bg-slate-800">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={sendMessage} className="mt-4 flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                />
                <Button type="submit" size="sm" className="rounded-full px-4" disabled={isTyping || !input.trim()}>
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
              className="relative mb-6 rounded-2xl rounded-br-none bg-white px-4 py-3 shadow-lg dark:bg-slate-800"
            >
              <p className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                Hi! <br />
                <span className="text-accent-500">Need help?</span>
              </p>
              {/* Little triangle for the speech bubble */}
              <div className="absolute -bottom-2 right-0 h-4 w-4 border-l-8 border-t-8 border-transparent border-t-white dark:border-t-slate-800" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mascot Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-50 shadow-xl shadow-accent-500/20 transition-transform hover:scale-105 hover:shadow-accent-500/40 active:scale-95 dark:border-slate-900 dark:bg-slate-800 sm:h-24 sm:w-24"
        >
          <TutorMascotSVG className="h-full w-full object-cover p-2 transition-transform group-hover:scale-110" />
        </button>
      </div>
    </div>
  );
}
