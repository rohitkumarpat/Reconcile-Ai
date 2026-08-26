import { prisma } from "../lib/prisma";

export async function listSubscriptions(userId: string) {
  return prisma.subscription.findMany({
    where: { userId },
    orderBy: { lastSeen: "desc" },
  });
}