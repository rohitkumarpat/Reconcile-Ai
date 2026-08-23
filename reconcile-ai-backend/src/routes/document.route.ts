import { Router } from "express";
import { requireAuthMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import {
  uploadDocument,
  getDocuments,
} from "../controllers/document.controller";

const router = Router();

router.post(
  "/",
  requireAuthMiddleware,
  upload.single("file"),
  uploadDocument
);

router.get(
  "/",
  requireAuthMiddleware,
  getDocuments
);

export default router;