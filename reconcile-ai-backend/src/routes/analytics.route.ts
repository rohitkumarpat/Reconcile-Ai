import { Router } from "express";
import { requireAuthMiddleware } from "../middleware/auth.middleware";
import { getAnalytics } from "../controllers/analytics.controller";

const router = Router();

router.get("/", requireAuthMiddleware, getAnalytics);

export default router;