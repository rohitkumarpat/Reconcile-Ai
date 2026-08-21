import { SignUp } from "@clerk/clerk-react";

export default function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
      />
    </div>
  );
}