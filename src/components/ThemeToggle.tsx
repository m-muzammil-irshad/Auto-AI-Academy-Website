"use client";
 
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
 
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  return (
    <button
      type="button"
      aria-label="Toggle dark/light theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="neu-btn relative flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-all duration-200 hover:text-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 dark:text-slate-300 dark:hover:text-accent-400"
    >
      <Sun
        className={`h-5 w-5 transition-all duration-300 text-amber-500 ${
          isDark ? "rotate-90 scale-0 opacity-0 absolute" : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        className={`h-5 w-5 transition-all duration-300 text-indigo-400 ${
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0 absolute"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

