import type { HealthCheckResponse } from "../types/health";

const API_BASE_URL = import.meta.env.VITE_API_URL as string;

export async function checkHealth(): Promise<HealthCheckResponse> {
  const res = await fetch(`${API_BASE_URL}/health`);

  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }

  return res.json();
}