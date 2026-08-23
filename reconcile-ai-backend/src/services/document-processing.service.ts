import { prisma } from "../lib/prisma";
import {
  extractTextFromPdf,
  extractTextFromCsv,
} from "./extraction/textExtractor";
import { extractTextFromImage } from "./extraction/ocrExtractor";
import { extractTransactionsFromText } from "./extraction/llmExtractor";

async function fetchFileBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);

  const arrayBuffer = await res.arrayBuffer();

  return Buffer.from(arrayBuffer);
}

export async function processDocument(
  documentId: string,
  userId: string
) {
  const doc = await prisma.financialDocument.findFirstOrThrow({
    where: {
      id: documentId,
      userId,
    },
  });

  await prisma.financialDocument.update({
    where: { id: doc.id },
    data: { status: "PROCESSING" },
  });

  try {
    const buffer = await fetchFileBuffer(doc.fileUrl);

    let rawText: string;

    if (doc.fileName.endsWith(".pdf")) {
      rawText = await extractTextFromPdf(buffer);
    } else if (doc.fileName.endsWith(".csv")) {
      rawText = extractTextFromCsv(buffer);
    } else {
      rawText = await extractTextFromImage(buffer);
    }

    const extracted = await extractTransactionsFromText(rawText);

    const transactions = await prisma.$transaction(
      extracted.map((t) =>
        prisma.transaction.create({
          data: {
            userId,
            documentId: doc.id,
            merchant: t.merchant,
            amount: t.amount,
            category: t.category ?? "Other",
            date: new Date(t.date),
            description: t.description,
          },
        })
      )
    );

    await prisma.financialDocument.update({
      where: { id: doc.id },
      data: { status: "PROCESSED" },
    });

    return transactions;
  } catch (err) {
    await prisma.financialDocument.update({
      where: { id: doc.id },
      data: { status: "FAILED" },
    });

    throw err;
  }
}