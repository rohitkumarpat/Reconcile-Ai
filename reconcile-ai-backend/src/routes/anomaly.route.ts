import { Router } from "express";
import { requireAuthMiddleware } from "../middleware/auth.middleware";
import { getAnomalies } from "../controllers/anomaly.controller";

const router = Router();

router.get("/", requireAuthMiddleware, getAnomalies);

export default router;