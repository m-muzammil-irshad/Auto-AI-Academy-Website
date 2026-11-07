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
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <Sun
        className={`h-4 w-4 text-slate-600 dark:text-slate-300 transition-transform ${
          isDark ? "scale-0 opacity-0 absolute" : "scale-100 opacity-100"
        }`}
      />
      <Moon
        className={`h-4 w-4 text-slate-600 dark:text-slate-300 transition-transform ${
          isDark ? "scale-100 opacity-100" : "scale-0 opacity-0 absolute"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

