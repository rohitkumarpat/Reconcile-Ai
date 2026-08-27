import { prisma } from "../lib/prisma";

export async function decideAction(
  actionId: string,
  userId: string,
  decision: "APPROVED" | "REJECTED" | "EDITED",
  editedText?: string
) {
  const action = await prisma.action.findFirstOrThrow({
    where: { id: actionId, userId },
    include: { recommendation: { include: { anomaly: true } } },
  });

  const updated = await prisma.action.update({
    where: { id: action.id },
    data: {
      status: decision,
      finalText: decision === "EDITED" ? editedText : decision === "APPROVED" ? action.draftText : null,
    },
  });

  if ((decision === "APPROVED" || decision === "REJECTED") && action.recommendation.anomalyId) {
    await prisma.anomaly.update({
      where: { id: action.recommendation.anomalyId },
      data: { resolved: true },
    });
  }

  return updated;
}