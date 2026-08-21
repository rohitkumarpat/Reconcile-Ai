import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
      />
    </div>
  );
}