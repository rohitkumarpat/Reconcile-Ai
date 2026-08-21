import { Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { syncUser } from "../services/user.service";

export async function getMe(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    const email =
      clerkUser.emailAddresses[0]?.emailAddress ?? "";

    const user = await syncUser(userId, email);

    return res.json(user);
  } catch (error) {
    console.error("getMe error:", error);

    return res.status(500).json({
      error: "Failed to fetch user",
    });
  }
}