import { geminiModel } from "../../lib/gemini";
import {
  extractionResultSchema,
  ExtractedTransaction,
} from "../../validators/extraction.validator";

const EXTRACTION_PROMPT = `You are a financial document parser. Extract every transaction from the text below.

Return ONLY valid JSON matching this exact shape:
{
  "transactions": [
    {
      "merchant": string,
      "amount": number,
      "date": "YYYY-MM-DD",
      "category": string,
      "description": string
    }
  ]
}

Rules:
- amount is always positive
- date must be YYYY-MM-DD
- category should be one of: Food, Shopping, Transport, Entertainment, Bills, Subscriptions, Education, Healthcare, Other
- If no transactions are found, return { "transactions": [] }
- Do not invent transactions that aren't in the text

TEXT:
"""
{{TEXT}}
"""`;

export async function extractTransactionsFromText(
  text: string
): Promise<ExtractedTransaction[]> {
  const prompt = EXTRACTION_PROMPT.replace(
    "{{TEXT}}",
    text.slice(0, 20000)
  );

  const result = await geminiModel.generateContent(prompt);
  const raw = result.response.text();

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("LLM returned invalid JSON");
  }

  const validated = extractionResultSchema.safeParse(parsed);

  if (!validated.success) {
    throw new Error(
      `Extraction validation failed: ${validated.error.message}`
    );
  }

  return validated.data.transactions;
}