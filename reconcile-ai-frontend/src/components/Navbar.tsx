import { UserButton } from "@clerk/clerk-react";

export default function Navbar() {
  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-end px-6">
      <UserButton />
    </header>
  );
}