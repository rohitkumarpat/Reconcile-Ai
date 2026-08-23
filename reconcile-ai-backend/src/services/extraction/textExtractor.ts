import { PDFParse } from "pdf-parse";
import { parse } from "csv-parse/sync";

export async function extractTextFromPdf(
  buffer: Buffer
): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();

  await parser.destroy();

  return result.text;
}

export function extractTextFromCsv(buffer: Buffer): string {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
  });

  return (records as Record<string, string>[])
    .map((r) => JSON.stringify(r))
    .join("\n");
}