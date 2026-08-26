import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";
import { generateRecommendations } from "../services/recommendation.service";
import { decideAction } from "../services/action.service";
import { z } from "zod";
import { listActions } from "../services/recommendation.service";

export async function triggerRecommendations(req: Request, res: Response) {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { clerkId },
  });

  const result = await generateRecommendations(user.id);

  res.json(result);
}

const decisionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED", "EDITED"]),
  editedText: z.string().optional(),
});

export async function updateAction(req: Request, res: Response) {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { clerkId },
  });

  const parsed = decisionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.flatten(),
    });
  }

  const updated = await decideAction(
    req.params.id as string,
    user.id,
    parsed.data.decision,
    parsed.data.editedText
  );

  res.json(updated);
}


export async function getActions(req: Request, res: Response) {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });
  const user = await prisma.user.findUniqueOrThrow({ where: { clerkId } });

  const actions = await listActions(user.id);

  // category averages computed from all of the user's transactions
  const allTxns = await prisma.transaction.findMany({ where: { userId: user.id } });
  const categoryStats: Record<string, { sum: number; count: number }> = {};
  for (const t of allTxns) {
    const cat = t.category ?? "Other";
    if (!categoryStats[cat]) categoryStats[cat] = { sum: 0, count: 0 };
    categoryStats[cat].sum += t.amount;
    categoryStats[cat].count += 1;
  }

  const result = actions.map((a) => {
    const txn = a.recommendation.anomaly?.transaction;
    let impact = null;

    if (txn) {
      const cat = txn.category ?? "Other";
      const stats = categoryStats[cat];
      const avg = stats ? stats.sum / stats.count : 0;
      if (avg > 0) {
        impact = {
          category: cat,
          merchant: txn.merchant,
          amount: txn.amount,
          average: avg,
          multiplier: txn.amount / avg,
          aboveAverage: txn.amount - avg,
        };
      }
    }

    return { action: a, recommendation: a.recommendation, impact };
  });

  res.json(result);
}