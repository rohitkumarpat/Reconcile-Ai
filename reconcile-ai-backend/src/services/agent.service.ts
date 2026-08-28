import { prisma } from "../lib/prisma";
import { generateRecommendations } from "./recommendation.service";
interface AgentRunResult {
  categorized: { id: string; category: string; confidence: number }[];
  summary:any;
  duplicates: {
    transaction_id: string;
    duplicate_of_id: string;
    confidence: number;
  }[];
  subscriptions: {
    merchant: string;
    amount: number;
    frequency: string;
    transaction_ids: string[];
  }[];
  anomalies: {
    transaction_id: string;
    type: string;
    explanation: string;
    confidence: number;
  }[];
}


export async function runAgentOnTransactions(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
  });

  const res = await fetch(
    `${process.env.AGENT_SERVICE_URL}/agent/run`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": process.env.NODE_BACKEND_SECRET!,
      },
      body: JSON.stringify({
        transactions: transactions.map((t) => ({
          id: t.id,
          merchant: t.merchant,
          amount: t.amount,
          date: t.date.toISOString(),
          description: t.description,
        })),
      }),
    }
  );

if (!res.ok) {
  const errorText = await res.text();

  console.error("Agent service error:", {
    status: res.status,
    statusText: res.statusText,
    body: errorText,
  });

  throw new Error(
    `Agent service failed: ${res.status} ${errorText}`
  );
}

  const result: AgentRunResult = await res.json();

  await prisma.$transaction([
  ...result.categorized.map((c) =>
    prisma.transaction.update({
      where: { id: c.id },
      data: { category: c.category }
    })
  ),

  ...result.duplicates.map((d) =>
  prisma.anomaly.create({
    data: {
      userId,
      transactionId: d.transaction_id,
      relatedTransactionId: d.duplicate_of_id,
      type: "DUPLICATE",
      explanation: `Matches transaction on ${d.duplicate_of_id} — same merchant and amount within 3 days`,
      confidence: d.confidence,
    },
  })
),

  ...result.anomalies.flatMap((a) => [
    prisma.anomaly.create({
      data: {
        userId,
        transactionId: a.transaction_id,
        type: a.type as any,
        explanation: a.explanation,
        confidence: a.confidence,
      },
    }),
  ]),

  ...result.subscriptions.map((s) =>
    prisma.subscription.create({
      data: {
        userId,
        merchant: s.merchant,
        amount: s.amount,
        frequency: s.frequency,
        lastSeen: new Date(),
      },
    })
  ),

  prisma.agentRun.create({
    data: {
      userId,
      status: "COMPLETED",
      summary: result.summary
    }
  }),
]);

  return result;
}


export async function runFullAnalysis(userId: string) {
  const runResult = await runAgentOnTransactions(userId);
  const recommendations = await generateRecommendations(userId);

  return {
    runResult,
    recommendations,
  };
}