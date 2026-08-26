import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoute from "./routes/health.route";
import { withClerk } from "./middleware/auth.middleware";
import userRoute from "./routes/user.route";
import documentRoute from "./routes/document.route";
import transactionRoute from "./routes/transaction.route";
import agentRoute from "./routes/agent.route";
import recommendationRoute from "./routes/recommendation.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 5000;
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());
app.use(withClerk);

app.use("/api/health", healthRoute);
app.use("/api/users", userRoute);
app.use("/api/documents", documentRoute);
app.use("/api/transactions", transactionRoute);
app.use("/api/agent", agentRoute);
app.use("/api/recommendations", recommendationRoute);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});