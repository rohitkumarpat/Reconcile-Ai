export interface HealthCheckResponse {
  status: "ok" | "error";
  timestamp: string;
  database: "connected" | "disconnected";
}