import { useState, useEffect } from "react";
import { getStoredUser, type AppUser } from "@/lib/api";

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(getStoredUser());

  useEffect(() => {
    const handleUpdate = () => {
      setUser(getStoredUser());
    };

    window.addEventListener("user-updated", handleUpdate);
    return () => window.removeEventListener("user-updated", handleUpdate);
  }, []);

  return { user, refreshUser: () => setUser(getStoredUser()) };
}
