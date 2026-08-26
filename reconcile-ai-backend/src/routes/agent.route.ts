import { Router } from "express";
import { triggerAgentRun,triggerFullAnalysis } from "../controllers/agent.controller";
import { requireAuthMiddleware } from "../middleware/auth.middleware";
import { agentLimiter } from "../middleware/rateLimit.middleware";
const router = Router();

router.post("/run", requireAuthMiddleware, triggerAgentRun);
router.post(
  "/full-run",
  requireAuthMiddleware,
  agentLimiter,
  triggerFullAnalysis
);

export default router;