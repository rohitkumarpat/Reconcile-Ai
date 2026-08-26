import { prisma } from "../lib/prisma";

export async function generateRecommendations(userId: string) {
  const [subscriptions, anomalies] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId, active: true },
    }),
    prisma.anomaly.findMany({
      where: { userId, resolved: false },
    }),
  ]);

  const res = await fetch(
    `${process.env.AGENT_SERVICE_URL}/agent/recommend`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": process.env.NODE_BACKEND_SECRET!,
      },
      body: JSON.stringify({
        subscriptions: subscriptions.map((s) => ({
          merchant: s.merchant,
          amount: s.amount,
          frequency: s.frequency,
          transaction_ids: [],
        })),
        anomalies: anomalies.map((a) => ({
          transaction_id: a.transactionId,
          type: a.type,
          explanation: a.explanation,
          confidence: a.confidence,
        })),
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Recommendation generation failed");
  }

  const { recommendations, drafts } = await res.json();

  const created = [];

  for (let i = 0; i < recommendations.length; i++) {
    const rec = recommendations[i];
    const draft = drafts.find(
      (d: any) => d.recommendation_index === i
    );

    const recommendation = await prisma.recommendation.create({
      data: {
        userId,
        text: rec.text,
      },
    });

    const action = await prisma.action.create({
      data: {
        userId,
        recommendationId: recommendation.id,
        type: rec.action_type,
        draftText: draft?.draft_text ?? "",
        status: "PENDING",
      },
    });

    created.push({ recommendation, action });
  }

  return created;
}



export async function listActions(userId: string) {
  return prisma.action.findMany({
    where: { userId },
    include: { recommendation: true },
    orderBy: { createdAt: "desc" },
  });
}