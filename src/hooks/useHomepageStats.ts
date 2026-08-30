"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchHomepageStats,
  type HomepageStatsRow,
} from "@/lib/supabase/homepageStats";

export interface UseHomepageStatsResult {
  stats: HomepageStatsRow | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useHomepageStats(): UseHomepageStatsResult {
  const [stats, setStats] = useState<HomepageStatsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const row = await fetchHomepageStats();
      setStats(row);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "خطا در دریافت آمار صفحه اصلی",
      );
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { stats, loading, error, refresh: load };
}
