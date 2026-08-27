import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";

interface AnomalyItem { id: string; type: string; explanation: string; confidence: number; resolved: boolean; }

export default function Anomalies() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<AnomalyItem[] | null>(null);
  const [tab, setTab] = useState<"unresolved" | "resolved">("unresolved");

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/anomalies`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(await res.json());
    })();
  }, []);

  const badgeVariant = (type: string) => type === "DUPLICATE" ? "danger" : type === "FORGOTTEN_SUBSCRIPTION" ? "flagged" : "flagged";
  const filtered = items?.filter((a) => (tab === "unresolved" ? !a.resolved : a.resolved)) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold">Anomalies</h1>

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setTab("unresolved")}
          className={`px-3 py-2 text-sm font-medium ${tab === "unresolved" ? "border-b-2 border-brand text-brand" : "text-muted"}`}
        >
          Unresolved
        </button>
        <button
          onClick={() => setTab("resolved")}
          className={`px-3 py-2 text-sm font-medium ${tab === "resolved" ? "border-b-2 border-brand text-brand" : "text-muted"}`}
        >
          Resolved
        </button>
      </div>

      {filtered.length === 0 && (
        <EmptyState
          title={tab === "unresolved" ? "No unresolved anomalies" : "No resolved anomalies yet"}
          description={tab === "unresolved" ? "Your spending looks normal right now." : "Approved or rejected anomalies will appear here."}
        />
      )}

      <div className="grid gap-3">
        {filtered.map((a, i) => (
          <Card key={a.id} delay={i * 0.03}>
            <div className="flex justify-between items-start">
              <div>
                <Badge variant={badgeVariant(a.type)}>{a.type.replace(/_/g, " ")}</Badge>
                <p className="text-sm mt-2">{a.explanation}</p>
              </div>
              <span className="text-xs text-muted">{Math.round(a.confidence * 100)}% confidence</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
