import { motion } from "framer-motion";
import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
}

const variants = {
  primary: "bg-brand text-white hover:bg-brand/90",
  secondary: "bg-white border border-border text-ink hover:bg-slate-50",
  ghost: "text-muted hover:text-ink hover:bg-slate-50",
};

export function Button({ variant = "primary", loading, className, children, disabled, ...props }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed",
        variants[variant], className
      )}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </motion.button>
  );
}