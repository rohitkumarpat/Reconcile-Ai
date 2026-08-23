import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";
import {
  createDocument,
  listDocuments,
} from "../services/document.service";
import { uploadDocumentSchema } from "../validators/document.validator";

async function resolveUser(clerkId: string) {
  return prisma.user.findUniqueOrThrow({
    where: { clerkId },
  });
}

export async function uploadDocument(req: Request, res: Response) {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No file provided" });
  }

  const parsed = uploadDocumentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.flatten(),
    });
  }

  const user = await resolveUser(clerkId);

  const doc = await createDocument(
    user.id,
    req.file,
    parsed.data.fileType
  );

  res.status(201).json(doc);
}

export async function getDocuments(req: Request, res: Response) {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await resolveUser(clerkId);

  const docs = await listDocuments(user.id);

  res.json(docs);
}