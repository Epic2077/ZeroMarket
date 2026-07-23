"use client";

import { supabase } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface UserProfileRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  city: string | null;
  bio: string | null;
  avatar_path: string | null;
  role: "USER" | "ADMIN" | "OWNER";
  status: "ACTIVE" | "SUSPENDED";
  verified: boolean;
  seller_application_status: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  seller_slug: string | null;
  banner_preset_id: string | null;
  banner_image_path: string | null;
  response_rate: number | null;
  total_views: number | null;
  total_sales_volume: number | null;
  created_at: string;
  updated_at: string;
}

interface UserInfoContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfileRow | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserInfoContext = createContext<UserInfoContextValue | null>(null);

export function UserInfoProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      setProfile(null);
      return;
    }

    setProfile(data as UserProfileRow);
  }, []);

  const refreshProfile = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) {
      setProfile(null);
      return;
    }
    await loadProfile(userId);
  }, [loadProfile, session?.user?.id]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) {
        return;
      }

      setSession(data.session);
      if (data.session?.user?.id) {
        await loadProfile(data.session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (nextSession?.user?.id) {
        void loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo<UserInfoContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      loading,
      refreshProfile,
      signOut,
    }),
    [loading, profile, refreshProfile, session, signOut],
  );

  return (
    <UserInfoContext.Provider value={value}>
      {children}
    </UserInfoContext.Provider>
  );
}

export function useUserInfo() {
  const ctx = useContext(UserInfoContext);
  if (!ctx) {
    throw new Error("useUserInfo must be used within a <UserInfoProvider>");
  }
  return ctx;
}
