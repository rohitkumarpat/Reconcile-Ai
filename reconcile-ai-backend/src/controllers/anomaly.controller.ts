import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";
import { listAnomalies } from "../services/anomaly.service";

export async function getAnomalies(req: Request, res: Response) {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

  const user = await prisma.user.findUniqueOrThrow({
    where: { clerkId },
  });

  const anomalies = await listAnomalies(user.id);

  res.json(anomalies);
}