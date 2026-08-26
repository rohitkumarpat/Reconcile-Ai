import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";
import { generateRecommendations } from "../services/recommendation.service";
import { decideAction } from "../services/action.service";
import { z } from "zod";

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