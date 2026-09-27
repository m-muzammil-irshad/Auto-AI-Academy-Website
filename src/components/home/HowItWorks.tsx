const STEPS = [
  {
    n: 1,
    title: "Enroll",
    text: "Pick an ongoing course and join in one click.",
  },
  {
    n: 2,
    title: "Watch",
    text: "Follow along on the official YouTube channel.",
  },
  {
    n: 3,
    title: "Submit",
    text: "Turn in assignments via Google Drive links.",
  },
  {
    n: 4,
    title: "Rank",
    text: "Get graded and climb the public leaderboard.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
            How it works
          </h2>
          <p className="mt-2 text-slate-600">
            Four simple steps from first video to leaderboard.
          </p>
        </div>

        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="rounded-lg border border-slate-200 bg-slate-50/50 p-5"
            >
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-600 text-sm font-semibold text-white">
                {s.n}
              </div>
              <h3 className="font-heading text-base font-semibold">
                {s.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}