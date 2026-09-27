import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/format";

export interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex select-none items-center justify-center rounded-full bg-accent-100 font-semibold text-accent-700",
        sizes[size],
        className
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}