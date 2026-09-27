import type { ReactNode } from "react";

interface ValueItem {
  title: string;
  text: string;
  icon: ReactNode;
}

const VALUES: ValueItem[] = [
  {
    title: "Structured learning",
    text: "Curated course paths — not endless video dumps.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    ),
  },
  {
    title: "Real feedback",
    text: "Every submission is graded on correctness, creativity, and timeliness.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4M12 2a10 10 0 100 20 10 10 0 000-20z"
      />
    ),
  },
  {
    title: "Leaderboard recognition",
    text: "Stars add up. Consistency gets noticed.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 4h14v4a7 7 0 01-14 0V4zm0 0H3v2a3 3 0 003 3m14-5h2v2a3 3 0 01-3 3M9 20h6M12 15v5"
      />
    ),
  },
  {
    title: "Free certificate",
    text: "Complete a course and 80% of assignments to qualify.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15a6 6 0 100-12 6 6 0 000 12zm0 0v6l-3-2-3 2v-6m6 0l3 6 3-6"
      />
    ),
  },
];

export function ValueStrip() {
  return (
    <section id="why" className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
            Why learners stay
          </h2>
          <p className="mt-2 text-slate-600">
            Everything you need to actually finish what you start.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="rounded-lg border border-slate-200 p-5"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-accent-50 text-accent-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  {v.icon}
                </svg>
              </div>
              <h3 className="font-heading text-base font-semibold">
                {v.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{v.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}