import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}

const variants = {
  primary: "bg-brand text-white hover:bg-brand/90",
  secondary:
    "bg-white border border-border text-ink hover:bg-slate-50",
  ghost:
    "text-muted hover:text-ink hover:bg-slate-50",
};

export function Button({
  variant = "primary",
  className,
  children,
  type = "button",
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium",
        "transition-colors",
        variants[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </motion.button>
  );
}