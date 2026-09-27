import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="mb-2 text-sm font-medium text-accent-600">404</p>
      <h1 className="mb-2 text-2xl font-semibold">Page not found</h1>
      <p className="mb-6 text-slate-600">
        The page you are looking for doesn’t exist or has moved.
      </p>
      <Link href="/">
        <Button>Back to homepage</Button>
      </Link>
    </div>
  );
}