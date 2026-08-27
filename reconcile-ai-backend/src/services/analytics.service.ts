import { prisma } from "../lib/prisma";

export async function getMonthlyAnalytics(userId: string, month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: startDate, lt: endDate } },
  });

  const byCategory: Record<string, number> = {};
  for (const t of transactions) {
    const cat = t.category ?? "Other";
    byCategory[cat] = (byCategory[cat] ?? 0) + t.amount;
  }

  const [subscriptions, anomalies] = await Promise.all([
    prisma.subscription.findMany({ where: { userId, active: true } }),
    prisma.anomaly.count({ where: { userId, resolved: false } }),
  ]);

  // subscriptions the agent actually recommended cancelling (CANCELLATION_EMAIL action type)
  const cancellationRecs = await prisma.recommendation.findMany({
    where: {
      userId,
      subscriptionId: { not: null },
      action: { type: "CANCELLATION_EMAIL" },
    },
    include: { subscription: true },
  });

  const potentialSavings = cancellationRecs.reduce(
    (sum, r) => sum + (r.subscription?.amount ?? 0),
    0
  );

  const subscriptionCost = subscriptions.reduce((sum, s) => sum + s.amount, 0);
  const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);

  return {
    totalSpending,
    monthlySpending: totalSpending,
    subscriptionCost,
    potentialSavings, // now: sum of monthly amounts for subscriptions flagged for cancellation
    anomalyCount: anomalies,
    byCategory,
    recentTransactions: transactions.slice(0, 5),
  };
}
