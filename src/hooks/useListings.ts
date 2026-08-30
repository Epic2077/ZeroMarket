"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchListings,
  fetchListingById,
  fetchListingsBySeller,
  type ListingsFilter,
  type ListingRow,
} from "@/lib/supabase/listings";

// ── useListings (all listings, with optional filters) ─────────────────

export interface UseListingsResult {
  listings: ListingRow[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useListings(filter?: ListingsFilter): UseListingsResult {
  const [listings, setListings] = useState<ListingRow[]>([]);
  // Start false so SSR and the client's first hydration render match.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Serialise filter so we can use it as a dependency key
  const filterKey = JSON.stringify(filter);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchListings(filter);
      setListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت آگهی‌ها");
      setListings([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  useEffect(() => {
    void load();
  }, [load]);

  return { listings, loading, error, refresh: load };
}

// ── useListing (single listing by id) ─────────────────────────────────

export interface UseListingResult {
  listing: ListingRow | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useListing(id: string): UseListingResult {
  const [listing, setListing] = useState<ListingRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setListing(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchListingById(id);
      setListing(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت آگهی");
      setListing(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return { listing, loading, error, refresh: load };
}

// ── useSellerListings (listings for a specific seller) ────────────────

export interface UseSellerListingsResult {
  listings: ListingRow[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSellerListings(sellerId: string): UseSellerListingsResult {
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sellerId) {
      setListings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchListingsBySeller(sellerId);
      setListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت آگهی‌ها");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { listings, loading, error, refresh: load };
}
