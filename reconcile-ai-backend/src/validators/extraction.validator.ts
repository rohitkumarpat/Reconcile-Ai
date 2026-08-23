import { z } from "zod";

export const extractedTransactionSchema = z.object({
  merchant: z.string(),
  amount: z.number(),
  date: z.string(),
  category: z.string().optional(),
  description: z.string().optional(),
});

export const extractionResultSchema = z.object({
  transactions: z.array(extractedTransactionSchema),
});

export type ExtractedTransaction = z.infer<
  typeof extractedTransactionSchema
>;