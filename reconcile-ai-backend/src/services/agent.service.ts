import { prisma } from "../lib/prisma";

interface AgentRunResult {
  categorized: {
    id: string;
    category: string;
    confidence: number;
  }[];
  summary: any;
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
    throw new Error("Agent service failed");
  }

  const result: AgentRunResult = await res.json();

  await prisma.$transaction([
    ...result.categorized.map((c) =>
      prisma.transaction.update({
        where: { id: c.id },
        data: { category: c.category },
      })
    ),

    prisma.agentRun.create({
      data: {
        userId,
        status: "COMPLETED",
        summary: result.summary,
      },
    }),
  ]);

  return result;
}