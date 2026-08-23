import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { Button } from "./ui/Button";

const TYPES = [
  "BANK_STATEMENT",
  "UPI_STATEMENT",
  "CREDIT_CARD_STATEMENT",
  "RECEIPT",
  "CSV",
];

export function UploadDropzone({
  onUpload,
}: {
  onUpload: (file: File, type: string) => Promise<void>;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [fileType, setFileType] = useState(TYPES[0]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setLoading(true);

    try {
      await onUpload(file, fileType);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <select
        value={fileType}
        onChange={(e) => setFileType(e.target.value)}
        className="text-sm border border-border rounded-lg px-3 py-1.5"
      >
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {t.replace(/_/g, " ")}
          </option>
        ))}
      </select>

      <motion.div
        animate={{
          borderColor: dragOver ? "#2E3A8C" : "#E5E7EB",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);

          const file = e.dataTransfer.files[0];

          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer bg-white"
      >
        <UploadCloud
          className="mx-auto text-muted mb-2"
          size={28}
        />

        <p className="text-sm text-muted">
          {loading
            ? "Uploading..."
            : "Drag a statement or receipt here, or click to browse"}
        </p>

        <p className="text-xs text-muted mt-1">
          PDF, CSV, JPG, PNG — up to 10MB
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.csv,image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) handleFile(file);
          }}
        />
      </motion.div>

      <Button
        variant="secondary"
        onClick={() => inputRef.current?.click()}
      >
        Browse files
      </Button>
    </div>
  );
}