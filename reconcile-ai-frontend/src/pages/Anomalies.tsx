import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";

interface AnomalyItem {
  id: string;
  type: string;
  explanation: string;
  confidence: number;
  resolved: boolean;
}

export default function Anomalies() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<AnomalyItem[] | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getToken();

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/anomalies`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setItems(await res.json());
    })();
  }, []);

  const badgeVariant = (type: string) =>
    type === "DUPLICATE"
      ? "danger"
      : type === "FORGOTTEN_SUBSCRIPTION"
      ? "flagged"
      : "flagged";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold">
        Anomalies
      </h1>

      {items?.length === 0 && (
        <EmptyState
          title="No anomalies"
          description="Your spending looks normal — nothing flagged this period."
        />
      )}

      <div className="grid gap-3">
        {items?.map((a, i) => (
          <Card key={a.id} delay={i * 0.03}>
            <div className="flex justify-between items-start">
              <div>
                <Badge variant={badgeVariant(a.type)}>
                  {a.type.replace(/_/g, " ")}
                </Badge>

                <p className="text-sm mt-2">
                  {a.explanation}
                </p>
              </div>

              <span className="text-xs text-muted">
                {Math.round(a.confidence * 100)}% confidence
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}