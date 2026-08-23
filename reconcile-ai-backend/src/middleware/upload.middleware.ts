import multer from "multer";

const ALLOWED_TYPES = [
  "application/pdf",
  "text/csv",
  "image/jpeg",
  "image/png",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error("Unsupported file type"));
    }

    cb(null, true);
  },
});

