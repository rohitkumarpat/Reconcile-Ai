import { prisma } from "../lib/prisma";

export async function syncUser(
  clerkId: string,
  email: string
) {
  return prisma.user.upsert({
    where: {
      clerkId,
    },

    update: {
      email,
    },

    create: {
      clerkId,
      email,
    },
  });
}