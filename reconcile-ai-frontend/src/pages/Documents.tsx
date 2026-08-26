import { useEffect, useState } from "react";
import { UploadDropzone } from "../components/UploadDropzone";
import { Table } from "../components/ui/Table";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { useAuth } from "@clerk/clerk-react";
import { useDocumentsApi } from "../services/documents";

interface Doc {
  id: string; fileName: string; fileType: string; status: string; createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function Documents() {
  const { getToken } = useAuth();
  const { upload, list } = useDocumentsApi();
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function refresh() {
    const data = await list();
    setDocs(data);
  }

  useEffect(() => { refresh(); }, []);

  async function processDoc(id: string) {
    setProcessingId(id);
    try {
      const token = await getToken();
      await fetch(`${API_URL}/documents/${id}/process`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      await refresh();
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold">Documents</h1>
      <UploadDropzone onUpload={async (file, type) => { await upload(file, type); await refresh(); }} />

      {docs === null && <Skeleton className="h-40" />}
      {docs?.length === 0 && (
        <EmptyState title="No documents yet" description="Upload a bank statement, UPI statement, or receipt to get started." />
      )}
      {docs && docs.length > 0 && (
        <Table headers={["File", "Type", "Status", "Uploaded", "Action"]}>
          {docs.map((d) => (
            <tr key={d.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">{d.fileName}</td>
              <td className="px-4 py-3">{d.fileType.replace(/_/g, " ")}</td>
              <td className="px-4 py-3"><Badge variant="neutral">{d.status}</Badge></td>
              <td className="px-4 py-3 text-muted">{new Date(d.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                {d.status !== "PROCESSED" && (
                  <Button
                    variant="secondary"
                    loading={processingId === d.id}
                    onClick={() => processDoc(d.id)}
                  >
                    Process
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}