import { useEffect, useState } from "react";
import type { HealthCheckResponse } from "./types/health";
import { checkHealth } from "./lib/api";

function App() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth()
      .then(setHealth)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="p-8 bg-white rounded-lg shadow-md border border-slate-200">
        <h1 className="text-xl font-semibold text-slate-800 mb-4">
          ReconcileAI — Day 1 Health Check
        </h1>

        {error && (
          <p className="text-red-600">
            Error: {error}
          </p>
        )}

        {health && (
          <div className="space-y-1 text-sm text-slate-600">
            <p>
              Status:{" "}
              <span className="font-medium">{health.status}</span>
            </p>

            <p>
              Database:{" "}
              <span className="font-medium">{health.database}</span>
            </p>

            <p>Timestamp: {health.timestamp}</p>
          </div>
        )}

        {!health && !error && (
          <p className="text-slate-400">Checking...</p>
        )}
      </div>
    </div>
  );
}

export default App;