import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Table } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";

interface Sub {
  id: string;
  merchant: string;
  amount: number;
  frequency: string;
  active: boolean;
  lastSeen: string;
}

export default function Subscriptions() {
  const { getToken } = useAuth();
  const [subs, setSubs] = useState<Sub[] | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getToken();

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/subscriptions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubs(await res.json());
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold">
        Subscriptions
      </h1>

      {subs?.length === 0 && (
        <EmptyState
          title="No subscriptions detected"
          description="Run the agent after uploading a few months of statements to detect recurring charges."
        />
      )}

      {subs && subs.length > 0 && (
        <Table
          headers={[
            "Merchant",
            "Amount",
            "Frequency",
            "Status",
            "Last Seen",
          ]}
        >
          {subs.map((s) => (
            <tr
              key={s.id}
              className="border-b border-border last:border-0"
            >
              <td className="px-4 py-3">{s.merchant}</td>

              <td className="px-4 py-3 font-figures">
                ₹{s.amount.toFixed(2)}
              </td>

              <td className="px-4 py-3">
                {s.frequency}
              </td>

              <td className="px-4 py-3">
                <Badge variant={s.active ? "positive" : "neutral"}>
                  {s.active ? "Active" : "Inactive"}
                </Badge>
              </td>

              <td className="px-4 py-3 text-muted">
                {new Date(s.lastSeen).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}