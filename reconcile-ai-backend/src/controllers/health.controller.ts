import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface HealthCheckResponse {
  status: "ok" | "error";
  timestamp: string;
  database: "connected" | "disconnected";
}

export async function getHealth(req: Request, res: Response) {
  let dbStatus: HealthCheckResponse["database"] = "disconnected";

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (err) {
    console.error("Database health check failed:", err);
  }

  const response: HealthCheckResponse = {
    status: dbStatus === "connected" ? "ok" : "error",
    timestamp: new Date().toISOString(),
    database: dbStatus,
  };

  res.status(dbStatus === "connected" ? 200 : 503).json(response);
}