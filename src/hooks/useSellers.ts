"use client";

import { useCallback, useEffect, useState } from "react";
import type { SellerSummary } from "@/types/dataTypes";
import {
  fetchSellerBrandsAndMinPrice,
  fetchSellers,
  fetchSellerById,
  sellerRowToSummary,
  type SellerRow,
} from "@/lib/supabase/sellers";

// ── useSellers (all sellers) ─────────────────────────────────────────

export interface UseSellersResult {
  sellers: SellerSummary[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSellers(): UseSellersResult {
  const [sellers, setSellers] = useState<SellerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rows, listingMap] = await Promise.all([
        fetchSellers(),
        fetchSellerBrandsAndMinPrice(),
      ]);
      setSellers(
        rows.map((row) => sellerRowToSummary(row, listingMap.get(row.id))),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت فروشندگان");
      setSellers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { sellers, loading, error, refresh: load };
}

// ── useSeller (single seller by id) ──────────────────────────────────

export interface UseSellerResult {
  seller: (SellerRow & { summary: SellerSummary }) | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSeller(id: string): UseSellerResult {
  const [seller, setSeller] = useState<
    (SellerRow & { summary: SellerSummary }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setSeller(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const row = await fetchSellerById(id);
      if (!row) {
        setSeller(null);
        setLoading(false);
        return;
      }
      const listingMap = await fetchSellerBrandsAndMinPrice();
      setSeller({
        ...row,
        summary: sellerRowToSummary(row, listingMap.get(row.id)),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت فروشنده");
      setSeller(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return { seller, loading, error, refresh: load };
}
