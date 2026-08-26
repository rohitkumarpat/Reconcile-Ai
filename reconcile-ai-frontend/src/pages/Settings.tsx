import { UserProfile } from "@clerk/clerk-react";
import { Card } from "../components/ui/Card";

export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold">Settings</h1>
      <Card>
        <UserProfile routing="virtual" />
      </Card>
    </div>
  );
}