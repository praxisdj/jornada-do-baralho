"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import type { User } from "@/types/user.type";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async () => {
    // Only run on client side
    if (typeof window === "undefined") {
      return;
    }

    const userId = (session?.user as User)?.id;

    if (!userId) {
      setUser(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/user/${userId}`);

      if (!response.ok) {
        if (response.status === 404) {
          console.error("User not found in database, clearing session");
          setUser(null);
          setError("User not found. Please log out and log back in.");
          return;
        }
        throw new Error(`Failed to fetch user details: ${response.statusText}`);
      }

      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch user details";
      setError(errorMessage);
      console.error("Error fetching user details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  const refetchUser = async () => {
    await fetchUserDetails();
  };

  // Fetch user details when session changes
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      return;
    }

    const userId = (session?.user as User)?.id;
    if (status === "authenticated" && userId) {
      fetchUserDetails();
    } else if (status === "unauthenticated") {
      setUser(null);
      setError(null);
    }
  }, [session, status, fetchUserDetails]);

  const value: UserContextType = {
    user,
    isLoading,
    error,
    refetchUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
