import { Router } from "express";
import { requireAuthMiddleware } from "../middleware/auth.middleware";
import {
  triggerRecommendations,
  updateAction,
  getActions
} from "../controllers/recommendation.controller";

const router = Router();

router.post("/generate", requireAuthMiddleware, triggerRecommendations);
router.patch("/actions/:id", requireAuthMiddleware, updateAction);
router.get(
  "/actions",
  requireAuthMiddleware,
  getActions
);
export default router;