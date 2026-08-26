import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useAuth } from "@clerk/clerk-react";

interface ActionItem {
  action: { id: string; draftText: string; status: string };
  recommendation: { text: string };
}

export default function Agent() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<ActionItem[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
   const [runLoading, setRunLoading] = useState(false);
   const [decidingId, setDecidingId] = useState<string | null>(null);
  useEffect(() => {
  (async () => {
    const token = await getToken();

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/recommendations/actions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setItems(await res.json());
  })();
}, []);



async function runAgent() {
  setRunLoading(true);
  try {
    const token = await getToken();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/agent/full-run`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setItems(data.recommendations);
  } finally {
    setRunLoading(false);
  }
}

async function decide(actionId: string, decision: string, text?: string) {
  setDecidingId(actionId);
  try {
    const token = await getToken();
    await fetch(`${import.meta.env.VITE_API_URL}/recommendations/actions/${actionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ decision, editedText: text }),
    });
    await runAgent(); // or a lighter refetch
  } finally {
    setDecidingId(null);
  }
}

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-display font-semibold">Agent</h1>

        <Button onClick={runAgent} loading={runLoading}>Run Full Analysis</Button>
      </div>

      {items.map(({ action, recommendation }) => (
        <Card key={action.id}>
          <p className="text-sm text-muted">{recommendation.text}</p>

          {editing === action.id ? (
            <textarea
              className="w-full mt-2 border border-border rounded-lg p-2 text-sm"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
          ) : (
            <p className="mt-2 text-sm bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">
              {action.draftText}
            </p>
          )}

          <div className="flex gap-2 mt-3">
            <Button variant="primary" loading={decidingId === action.id} onClick={() => decide(action.id, "APPROVED")}>Approve</Button>

            <Button
              variant="secondary"
              onClick={() => {
                setEditing(action.id);
                setEditText(action.draftText);
              }}
            >
              Edit
            </Button>

            {editing === action.id && (
              <Button
                variant="secondary"
                onClick={() =>
                  decide(action.id, "EDITED", editText)
                }
              >
                Save Edit
              </Button>
            )}
           <Button variant="ghost" loading={decidingId === action.id} onClick={() => decide(action.id, "REJECTED")}>Reject</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}