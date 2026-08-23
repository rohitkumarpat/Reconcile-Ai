import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL;

export function useDocumentsApi() {
  const { getToken } = useAuth();

  async function upload(file: File, fileType: string) {
    const token = await getToken();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType);

    const res = await fetch(`${API_URL}/documents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    return res.json();
  }

  async function list() {
    const token = await getToken();

    const res = await fetch(`${API_URL}/documents`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch documents");

    return res.json();
  }

  return { upload, list };
}