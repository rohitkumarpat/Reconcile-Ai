import { clerkMiddleware, requireAuth } from "@clerk/express";

export const withClerk = clerkMiddleware();

export const requireAuthMiddleware = requireAuth();