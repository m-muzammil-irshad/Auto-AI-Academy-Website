import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function FinalCTA() {
  return (
    <section className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
        <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
          Ready to start learning?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-slate-600">
          Create a free account and enroll in your first course in under a
          minute.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/signup">
            <Button size="lg">Create free account</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}