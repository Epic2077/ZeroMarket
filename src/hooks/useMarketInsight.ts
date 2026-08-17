"use client";

import { useCallback, useEffect, useState } from "react";
import type { MarketDisplayFields } from "@/types/dataTypes";
import { supabase } from "@/lib/supabase/client";

interface UseMarketInsightResult {
  market: MarketDisplayFields | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Fetch market analytics for a car brand+model+year from
 * `car_market_insights`. Returns computed display fields
 * (avg price, price-vs-market %, 7-day trend %).
 */
export function useMarketInsight(
  brand: string,
  model: string,
  year: number,
  listingPrice: number,
): UseMarketInsightResult {
  const [market, setMarket] = useState<MarketDisplayFields | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!brand || !model) {
      setMarket(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: qError } = await supabase
        .from("car_market_insights")
        .select("avg_listed_price, avg_price_7d_ago, avg_sold_price")
        .eq("brand", brand)
        .eq("model", model)
        .eq("year", String(year))
        .maybeSingle();

      if (qError) throw qError;
      if (!data) {
        setMarket(null);
        setLoading(false);
        return;
      }

      const avg = Number(data.avg_listed_price);
      const avgSold = Number(data.avg_sold_price || 0);
      if (!avg || avg <= 0) {
        setMarket(null);
        setLoading(false);
        return;
      }

      const priceVsMarket = Math.round(((listingPrice - avg) / avg) * 100);
      const ago7d = Number(data.avg_price_7d_ago || 0);
      const trend7d = ago7d > 0 ? Math.round(((avg - ago7d) / ago7d) * 100) : 0;

      setMarket({
        marketAvgBuy: avg,
        marketAvgSell: avgSold > 0 ? avgSold : avg,
        priceVsMarket,
        trend7d,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "خطا در دریافت داده‌های بازار",
      );
      setMarket(null);
    } finally {
      setLoading(false);
    }
  }, [brand, model, year, listingPrice]);

  useEffect(() => {
    void load();
  }, [load]);

  return { market, loading, error, refresh: load };
}
