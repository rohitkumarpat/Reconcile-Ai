import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

const variants = {
  positive: "bg-positive-light text-positive",
  flagged: "bg-flagged-light text-flagged",
  danger: "bg-danger-light text-danger",
  neutral: "bg-slate-100 text-muted",
};

interface BadgeProps {
  children: ReactNode;
  variant?: keyof typeof variants;
}

export function Badge({
  children,
  variant = "neutral",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5",
        "rounded-full text-xs font-medium",
        variants[variant]
      )}
    >
      {children}
    </span>
  );
}
