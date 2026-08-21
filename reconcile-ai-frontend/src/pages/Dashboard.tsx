import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CreditCard,
  PiggyBank,
  Receipt,
  TriangleAlert,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

const stats = [
  {
    label: "Total Spending",
    value: "₹48,320",
    trend: "+4.2%",
    description: "vs. last month",
    icon: CreditCard,
    tone: "neutral" as const,
  },
  {
    label: "Subscriptions",
    value: "₹3,847",
    trend: "3 active",
    description: "monthly recurring",
    icon: Receipt,
    tone: "neutral" as const,
  },
  {
    label: "Potential Savings",
    value: "₹1,200",
    trend: "identified",
    description: "from subscriptions",
    icon: PiggyBank,
    tone: "positive" as const,
  },
  {
    label: "Anomalies",
    value: "2",
    trend: "needs review",
    description: "transactions flagged",
    icon: TriangleAlert,
    tone: "flagged" as const,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
      >
        <div>
          <p className="text-sm text-muted mb-1">
            Overview
          </p>

          <h1 className="text-2xl md:text-3xl font-display font-semibold text-ink">
            Dashboard
          </h1>

          <p className="text-sm text-muted mt-1">
            Monitor your financial activity and reconciliation status.
          </p>
        </div>

        <div className="text-xs text-muted">
          Updated just now
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.label}
              delay={index * 0.06}
              className="relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted">
                    {stat.label}
                  </p>

                  <p className="text-2xl font-figures mt-2 text-ink">
                    {stat.value}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-brand-light text-brand">
                  <Icon size={18} />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Badge variant={stat.tone}>
                  {stat.trend}
                </Badge>

                <span className="text-xs text-muted">
                  {stat.description}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Reconciliation overview */}
        <Card
          delay={0.3}
          className="xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-semibold text-ink">
                Reconciliation Overview
              </h2>

              <p className="text-sm text-muted mt-1">
                Current transaction reconciliation status.
              </p>
            </div>

            <ArrowUpRight
              size={18}
              className="text-muted"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted">
                Reconciled
              </p>

              <p className="text-xl font-figures mt-1">
                842
              </p>

              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "84%" }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="h-full bg-positive rounded-full"
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-muted">
                Pending
              </p>

              <p className="text-xl font-figures mt-1">
                126
              </p>

              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "12%" }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="h-full bg-brand rounded-full"
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-muted">
                Flagged
              </p>

              <p className="text-xl font-figures mt-1">
                32
              </p>

              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "4%" }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="h-full bg-flagged rounded-full"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Recent activity */}
        <Card delay={0.35}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-semibold text-ink">
                Recent Activity
              </h2>

              <p className="text-sm text-muted mt-1">
                Latest updates
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                title: "Transaction reconciled",
                time: "2 min ago",
              },
              {
                title: "New document uploaded",
                time: "18 min ago",
              },
              {
                title: "Anomaly detected",
                time: "42 min ago",
              },
            ].map((activity) => (
              <div
                key={activity.title}
                className="flex items-start gap-3"
              >
                <div className="w-2 h-2 mt-2 rounded-full bg-brand shrink-0" />

                <div>
                  <p className="text-sm text-ink">
                    {activity.title}
                  </p>

                  <p className="text-xs text-muted mt-0.5">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}