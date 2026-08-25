import { Router } from "express";
import { triggerAgentRun } from "../controllers/agent.controller";
import { requireAuthMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/run", requireAuthMiddleware, triggerAgentRun);

export default router;