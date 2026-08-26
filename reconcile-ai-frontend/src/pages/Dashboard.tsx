import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";

interface Analytics {
  totalSpending: number;
  subscriptionCost: number;
  potentialSavings: number;
  anomalyCount: number;
  byCategory: Record<string, number>;
  recentTransactions: { id: string; merchant: string; amount: number; date: string }[];
}

const COLORS = ["#2E3A8C", "#0F9D6B", "#D97706", "#6B7280", "#8B5CF6", "#EC4899", "#0EA5E9"];

export default function Dashboard() {
  const { getToken } = useAuth();
  const [data, setData] = useState<Analytics | null>(null);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(await res.json());
    })();
  }, [month, year]);

  const stats = data ? [
    { label: "Total Spending", value: `₹${data.totalSpending.toFixed(0)}`, tone: "neutral" as const },
    { label: "Subscriptions", value: `₹${data.subscriptionCost.toFixed(0)}`, tone: "neutral" as const },
    { label: "Potential Savings", value: `₹${data.potentialSavings.toFixed(0)}`, tone: "positive" as const },
    { label: "Anomalies", value: `${data.anomalyCount}`, tone: data.anomalyCount > 0 ? "flagged" as const : "neutral" as const },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-display font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="text-sm border border-border rounded-lg px-3 py-1.5">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString("default", { month: "long" })}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="text-sm border border-border rounded-lg px-3 py-1.5">
            {[year - 1, year].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {!data && <div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <Card key={s.label} delay={i * 0.05}>
                <p className="text-sm text-muted">{s.label}</p>
                <p className="text-2xl font-figures mt-1">{s.value}</p>
                {s.label === "Anomalies" && <Badge variant={s.tone}>{data.anomalyCount > 0 ? "needs review" : "clean"}</Badge>}
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <h3 className="font-display font-semibold mb-3">Spending by Category</h3>
              {Object.keys(data.byCategory).length === 0 ? (
                <p className="text-sm text-muted py-8 text-center">No transactions this month</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={Object.entries(data.byCategory).map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                      {Object.keys(data.byCategory).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `₹${v.toFixed(0)}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <h3 className="font-display font-semibold mb-3">Recent Transactions</h3>
              {data.recentTransactions.length === 0 ? (
                <p className="text-sm text-muted py-8 text-center">No recent transactions</p>
              ) : (
                <div className="space-y-2">
                  {data.recentTransactions.map((t) => (
                    <div key={t.id} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                      <span>{t.merchant}</span>
                      <span className="font-figures">₹{t.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}