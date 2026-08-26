import { Router } from "express";
import { requireAuthMiddleware } from "../middleware/auth.middleware";
import {
  triggerRecommendations,
  updateAction,
} from "../controllers/recommendation.controller";

const router = Router();

router.post("/generate", requireAuthMiddleware, triggerRecommendations);
router.patch("/actions/:id", requireAuthMiddleware, updateAction);

export default router;