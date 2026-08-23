import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL;

export function useTransactionsApi() {
  const { getToken } = useAuth();

  async function list() {
    const token = await getToken();

    const res = await fetch(`${API_URL}/transactions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch transactions");
    }

    return res.json();
  }

  return { list };
}