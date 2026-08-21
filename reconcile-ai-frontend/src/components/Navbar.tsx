import { motion } from "framer-motion";
import { UserButton, useUser } from "@clerk/clerk-react";

export default function Navbar() {
  const { user } = useUser();

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-14 border-b border-border bg-white flex items-center justify-between px-6"
    >
      <div className="hidden md:block">
        <p className="text-sm text-muted">
          Welcome back
        </p>

        <p className="text-sm font-medium text-ink">
          {user?.firstName || "User"}
        </p>
      </div>

      <div className="ml-auto">
        <UserButton />
      </div>
    </motion.header>
  );
}