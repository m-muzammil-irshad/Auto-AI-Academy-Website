import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-lexend)", "system-ui", "sans-serif"],
      },
      colors: {
        accent: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;