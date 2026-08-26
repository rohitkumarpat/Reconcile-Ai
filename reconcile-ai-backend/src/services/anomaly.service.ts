import { prisma } from "../lib/prisma";

export async function listAnomalies(userId: string) {
  return prisma.anomaly.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}