import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SITE_NAME } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <div className="max-w-3xl">
          <p className="mb-4 inline-block rounded-full bg-accent-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-accent-700">
            {SITE_NAME}
          </p>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
            Learn programming, AI, and automation the structured way.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            Real courses, real assignments, real feedback. Watch on YouTube,
            submit your work, get graded, and climb the leaderboard.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="secondary">
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}