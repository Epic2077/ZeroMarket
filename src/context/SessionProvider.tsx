"use client";

import { CURRENT_ADMIN_ID } from "@/context/adminData";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// Mock "who am I" for the management surface. There is no real auth yet — the
// owner and admin panels set this on mount so the rest of the app (e.g. the
// "manage" buttons on public pages) can react to the current viewer.
export type ViewerRole = "guest" | "admin" | "owner";

interface Session {
  role: ViewerRole;
  adminId: string; // which admin is acting, when role === "admin"
}

interface SessionContextValue extends Session {
  setViewer: (next: Session) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  // Defaults to "owner" so the management affordances are visible in the demo.
  const [session, setSession] = useState<Session>({
    role: "owner",
    adminId: CURRENT_ADMIN_ID,
  });

  const setViewer = useCallback((next: Session) => setSession(next), []);

  const value = useMemo<SessionContextValue>(
    () => ({ ...session, setViewer }),
    [session, setViewer],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a <SessionProvider>");
  }
  return ctx;
}
