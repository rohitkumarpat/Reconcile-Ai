import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";
import { processDocument } from "../services/document-processing.service";

export async function triggerProcessing(req: Request, res: Response) {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { clerkId },
  });

  try {
    const documentId = String(req.params.id);
   const transactions = await processDocument(
     documentId,
     user.id
    );

    res.json({
      status: "PROCESSED",
      transactions,
    });
  } catch (err) {
    console.error(
      "Processing failed:",
      err instanceof Error ? err.message : err
    );

    res.status(500).json({
      error: "Document processing failed",
    });
  }
}