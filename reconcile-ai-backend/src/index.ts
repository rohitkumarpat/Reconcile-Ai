import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoute from "./routes/health.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 5000;
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

app.use("/api/health", healthRoute);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});