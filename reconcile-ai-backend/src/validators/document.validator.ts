import { z } from "zod";

export const uploadDocumentSchema = z.object({
  fileType: z.enum([
    "BANK_STATEMENT",
    "UPI_STATEMENT",
    "CREDIT_CARD_STATEMENT",
    "RECEIPT",
    "CSV",
  ]),
});