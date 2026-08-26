import { prisma } from "../lib/prisma";

export async function decideAction(
  actionId: string,
  userId: string,
  decision: "APPROVED" | "REJECTED" | "EDITED",
  editedText?: string
) {
  const action = await prisma.action.findFirstOrThrow({
    where: { id: actionId, userId },
  });

  return prisma.action.update({
    where: { id: action.id },
    data: {
      status: decision,
      finalText:
        decision === "EDITED"
          ? editedText
          : decision === "APPROVED"
            ? action.draftText
            : null,
    },
  });
}