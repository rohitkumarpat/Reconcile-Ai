import { Router } from "express";
import { requireAuthMiddleware } from "../middleware/auth.middleware";
import { getMe } from "../controllers/user.controller";

const router = Router();

router.get(
  "/me",
  requireAuthMiddleware,
  getMe
);

export default router;