import { prisma } from "../lib/prisma";

export async function getMonthlyAnalytics(
  userId: string,
  month: number,
  year: number
) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  const byCategory: Record<string, number> = {};

  for (const t of transactions) {
    const cat = t.category ?? "Other";
    byCategory[cat] = (byCategory[cat] ?? 0) + t.amount;
  }

  const [subscriptions, anomalies] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId, active: true },
    }),
    prisma.anomaly.count({
      where: { userId, resolved: false },
    }),
  ]);

  const subscriptionCost = subscriptions.reduce(
    (sum, s) => sum + s.amount,
    0
  );

  const totalSpending = transactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  return {
    totalSpending,
    monthlySpending: totalSpending,
    subscriptionCost,
    potentialSavings: subscriptionCost * 0.15,
    anomalyCount: anomalies,
    byCategory,
    recentTransactions: transactions.slice(0, 5),
  };
}