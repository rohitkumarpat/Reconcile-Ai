import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

export default function Dashboard() {
  const { getToken } = useAuth();

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const token = await getToken();

        const response = await fetch(
          "http://localhost:5000/api/users/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log("Current user:", data);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    }

    fetchCurrentUser();
  }, [getToken]);

  return (
    <h1 className="text-xl font-semibold text-slate-800">
      Dashboard
    </h1>
  );
}