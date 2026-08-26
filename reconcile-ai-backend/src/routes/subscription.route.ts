import { Router } from "express";
import { requireAuthMiddleware } from "../middleware/auth.middleware";
import { getSubscriptions } from "../controllers/subscription.controller";

const router = Router();

router.get("/", requireAuthMiddleware, getSubscriptions);

export default router;