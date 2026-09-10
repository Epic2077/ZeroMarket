"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Bookmark, Send } from "lucide-react";
import { fetchWishlistListings } from "@/lib/supabase/wishlist";
import { fetchBuyerRequests, type BuyRequestStatus } from "@/lib/supabase/buyRequests";
import { fetchPriceAlerts } from "@/lib/supabase/priceAlerts";
import { toFa } from "@/context/carLabels";

// ── Types ────────────────────────────────────────────────────────────

export interface UserStat {
  id: string;
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: React.ReactNode;
}

export interface UseUserStatsResult {
  stats: UserStat[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// ── Active request statuses ──────────────────────────────────────────

const ACTIVE_REQUEST_STATUSES: BuyRequestStatus[] = [
  "WAITING",
  "NEGOTIABLE",
  "ACCEPTED",
];

// ── Hook ─────────────────────────────────────────────────────────────

export function useUserStats(userId: string | undefined): UseUserStatsResult {
  const [stats, setStats] = useState<UserStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setStats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [wishlist, requests, alerts] = await Promise.all([
        fetchWishlistListings(userId),
        fetchBuyerRequests(userId),
        fetchPriceAlerts(userId),
      ]);

      const activeRequestCount = requests.filter((r) =>
        ACTIVE_REQUEST_STATUSES.includes(r.status),
      ).length;

      const activeAlertCount = alerts.filter((a) => a.is_active).length;

      setStats([
        {
          id: "us-saved",
          label: "آگهی‌های ذخیره‌شده",
          value: toFa(wishlist.length),
          change: "",
          up: true,
          icon: <Bookmark size={18} className="text-primary" />,
        },
        {
          id: "us-requests",
          label: "درخواست‌های فعال",
          value: toFa(activeRequestCount),
          change: "",
          up: true,
          icon: <Send size={18} className="text-accent" />,
        },
        {
          id: "us-alerts",
          label: "هشدارهای قیمت",
          value: toFa(activeAlertCount),
          change: "",
          up: true,
          icon: <Bell size={18} className="text-warning" />,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "خطا در دریافت آمار کاربر",
      );
      setStats([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { stats, loading, error, refresh: load };
}
