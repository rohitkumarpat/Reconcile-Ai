import { motion } from "framer-motion";
import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-ink">
            ReconcileAI
          </h1>

          <p className="text-sm text-muted mt-2">
            Intelligent financial reconciliation
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-2 shadow-[0_8px_30px_rgba(20,23,31,0.06)]">
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/signup"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 w-full",
                headerTitle: "font-display text-ink",
                headerSubtitle: "text-muted",
                formButtonPrimary:
                  "bg-brand hover:bg-brand/90 text-white",
                formFieldInput:
                  "border-border focus:border-brand focus:ring-brand",
                footerActionLink:
                  "text-brand hover:text-brand/80",
              },
            }}
          />
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Secure authentication powered by Clerk
        </p>
      </motion.div>
    </div>
  );
}