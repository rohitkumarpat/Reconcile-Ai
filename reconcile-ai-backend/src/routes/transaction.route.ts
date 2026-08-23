import { Router } from "express";
import { requireAuthMiddleware } from "../middleware/auth.middleware";
import { getTransactions } from "../controllers/transaction.controller";

const router = Router();

router.get(
  "/",
  requireAuthMiddleware,
  getTransactions
);

export default router;