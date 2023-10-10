"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export function SessionContextProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
