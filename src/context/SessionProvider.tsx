"use client";

import { CURRENT_ADMIN_ID } from "@/context/adminData";
import { useUserInfo } from "@/context/UserInfoProvider";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// Session context for management/viewer capabilities.
// Backend profile role is authoritative when available. setViewer is retained
// as a fallback override for legacy/demo flows where backend profile is absent.
export type ViewerRole = "user" | "admin" | "owner";

interface Session {
  role: ViewerRole;
  adminId: string; // which admin is acting, when role === "admin"
}

interface SessionContextValue extends Session {
  setViewer: (next: Session) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useUserInfo();

  // Legacy/manual override (used only when backend role is not available).
  const [override, setOverride] = useState<Session>({
    role: "user",
    adminId: CURRENT_ADMIN_ID,
  });

  const setViewer = useCallback((next: Session) => setOverride(next), []);

  const backendSession = useMemo<Session | null>(() => {
    if (!user || !profile) {
      return null;
    }

    if (profile.role === "OWNER") {
      return { role: "owner", adminId: CURRENT_ADMIN_ID };
    }

    if (profile.role === "ADMIN") {
      return { role: "admin", adminId: CURRENT_ADMIN_ID };
    }

    // Regular users are treated as guests for management controls.
    return { role: "user", adminId: CURRENT_ADMIN_ID };
  }, [profile, user]);

  const effectiveSession = backendSession ?? override;

  const value = useMemo<SessionContextValue>(
    () => ({ ...effectiveSession, setViewer }),
    [effectiveSession, setViewer],
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
