import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Card({
  children,
  className,
  delay = 0,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay,
        ease: "easeOut",
      }}
      whileHover={{ y: -2 }}
      className={cn(
        "bg-white border border-border rounded-xl p-5",
        "shadow-[0_1px_2px_rgba(20,23,31,0.04)]",
        "transition-shadow",
        "hover:shadow-[0_4px_16px_rgba(20,23,31,0.06)]",
        className
      )}
    >
      {children}
    </motion.div>
  );
}