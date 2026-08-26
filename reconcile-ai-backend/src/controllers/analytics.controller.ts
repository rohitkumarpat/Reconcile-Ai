import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";
import { getMonthlyAnalytics } from "../services/analytics.service";

export async function getAnalytics(req: Request, res: Response) {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { clerkId },
  });

  const now = new Date();

  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();

  const data = await getMonthlyAnalytics(
    user.id,
    month,
    year
  );

  res.json(data);
}