import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";
import { runAgentOnTransactions } from "../services/agent.service";

export async function triggerAgentRun(req: Request, res: Response) {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { clerkId },
    });

    const result = await runAgentOnTransactions(user.id);

    return res.json(result);
  } catch (err) {
    console.error(
      "Agent failed:",
      err instanceof Error ? err.message : err
    );

    return res.status(500).json({
      error: "Agent processing failed",
    });
  }
}