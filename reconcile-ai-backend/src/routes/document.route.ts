import { Router } from "express";
import { requireAuthMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import {
  uploadDocument,
  getDocuments,
} from "../controllers/document.controller";
import { triggerProcessing } from "../controllers/processing.controller";

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


router.post(
  "/:id/process",
  requireAuthMiddleware,
  triggerProcessing
);



export default router;