import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";
import { listSubscriptions } from "../services/subscription.service";

export async function getSubscriptions(req: Request, res: Response) {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const user = await prisma.user.findUniqueOrThrow({ where: { clerkId } });
  const subscriptions = await listSubscriptions(user.id);
  res.json(subscriptions);
}