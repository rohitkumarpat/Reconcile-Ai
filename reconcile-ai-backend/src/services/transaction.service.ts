import { prisma } from "../lib/prisma";

export async function listTransactions(userId: string) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
}