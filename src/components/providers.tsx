"use client";

import { SessionProvider } from "next-auth/react";
import { UserProvider } from "@/contexts/UserContext";
import { MotionProvider } from "@/contexts/MotionContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MotionProvider>
        <UserProvider>{children}</UserProvider>
      </MotionProvider>
    </SessionProvider>
  );
}
