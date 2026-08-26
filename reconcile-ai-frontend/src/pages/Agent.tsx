import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

interface Impact {
  category: string;
  merchant: string;
  amount: number;
  average: number;
  multiplier: number;
  aboveAverage: number;
}

interface ActionItem {
  action: { id: string; draftText: string; status: string; updatedAt: string };
  recommendation: { text: string };
  impact: Impact | null;
}

function openGmailCompose(draftText: string, subject: string) {
  const url = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(draftText)}`;
  window.open(url, "_blank");
}

export default function Agent() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<ActionItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [decidingKey, setDecidingKey] = useState<string | null>(null);

  async function loadActions() {
    const token = await getToken();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/recommendations/actions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems(await res.json());
  }

  useEffect(() => {
    (async () => {
      await loadActions();
      setInitialLoading(false);
    })();
  }, []);

  async function runAgent() {
    setRunLoading(true);
    try {
      const token = await getToken();
      await fetch(`${import.meta.env.VITE_API_URL}/agent/full-run`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      await loadActions();
    } finally {
      setRunLoading(false);
    }
  }

  async function decide(item: ActionItem, decision: string, text?: string) {
    setDecidingKey(`${item.action.id}-${decision}`);
    try {
      const token = await getToken();
      await fetch(`${import.meta.env.VITE_API_URL}/recommendations/actions/${item.action.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ decision, editedText: text }),
      });

      if (decision === "APPROVED") {
        openGmailCompose(text ?? item.action.draftText, item.recommendation.text);
      }

      await loadActions();
      setEditing(null);
    } finally {
      setDecidingKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-display font-semibold">Agent</h1>
        <Button onClick={runAgent} loading={runLoading}>Run Full Analysis</Button>
      </div>

      {initialLoading && <p className="text-sm text-muted">Loading...</p>}
      {!initialLoading && items.length === 0 && (
        <p className="text-sm text-muted">No recommendations yet — run analysis to check for issues.</p>
      )}

      {items.map(({ action, recommendation, impact }) => (
        <Card key={action.id}>
          {impact && (
            <div className="flex justify-between items-baseline mb-2">
              <span className="font-display font-semibold">{impact.merchant}</span>
              <span className="font-figures text-lg">₹{impact.amount.toFixed(0)}</span>
            </div>
          )}

          {action.status === "APPROVED" && (
            <div className="flex items-center gap-2 text-positive text-sm">
              <CheckCircle2 size={16} />
              Approved on {new Date(action.updatedAt).toLocaleDateString()}
            </div>
          )}

          {action.status === "REJECTED" && (
            <div className="flex items-center gap-2 text-danger text-sm">
              <XCircle size={16} />
              Rejected on {new Date(action.updatedAt).toLocaleDateString()}
            </div>
          )}

          {action.status !== "APPROVED" && action.status !== "REJECTED" && (
            <>
              <div className="p-3 bg-slate-50 rounded-lg border border-border space-y-1.5 text-sm">
                {impact ? (
                  <>
                    <p><span className="text-muted">Why?</span> This is {impact.multiplier.toFixed(1)}× your average {impact.category.toLowerCase()} transaction.</p>
                    <p><span className="text-muted">Impact</span> ₹{Math.abs(impact.aboveAverage).toFixed(0)} above your typical {impact.category.toLowerCase()} spend.</p>
                  </>
                ) : (
                  <p className="text-muted">Flagged by the agent based on transaction patterns across your statements.</p>
                )}
                <p><span className="text-muted">Recommendation</span> {recommendation.text}</p>
              </div>

              {editing === action.id ? (
                <textarea
                  className="w-full mt-2 border border-border rounded-lg p-2 text-sm"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
              ) : (
                <p className="mt-2 text-sm bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">{action.draftText}</p>
              )}

              <div className="flex gap-2 mt-3">
                <Button
                  variant="primary"
                  loading={decidingKey === `${action.id}-APPROVED`}
                  onClick={() => decide({ action, recommendation, impact }, "APPROVED", editing === action.id ? editText : undefined)}
                >
                  Approve
                </Button>
                {editing === action.id ? (
                  <Button variant="secondary" loading={decidingKey === `${action.id}-EDITED`} onClick={() => decide({ action, recommendation, impact }, "EDITED", editText)}>
                    Save Edit
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={() => { setEditing(action.id); setEditText(action.draftText); }}>
                    Edit
                  </Button>
                )}
                <Button variant="ghost" loading={decidingKey === `${action.id}-REJECTED`} onClick={() => decide({ action, recommendation, impact }, "REJECTED")}>
                  Reject
                </Button>
              </div>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}