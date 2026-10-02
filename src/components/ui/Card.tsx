import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/50 bg-white/50 shadow-sm dark:border-slate-800/50 dark:bg-slate-900/50 backdrop-blur-md",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-b border-slate-200/50 dark:border-slate-800/50 px-5 py-4", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-5 py-4", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-t border-slate-200/50 dark:border-slate-800/50 px-5 py-3", className)}
      {...rest}
    >
      {children}
    </div>
  );
}