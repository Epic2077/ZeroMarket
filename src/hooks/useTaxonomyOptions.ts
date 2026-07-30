"use client";

import type { TaxonomyCategory, TaxonomyRow } from "@/lib/supabase/taxonomy";
import { fetchAllTaxonomy } from "@/lib/supabase/taxonomy";
import { useCallback, useEffect, useState } from "react";

export interface UseTaxonomyOptionsResult {
  /** All taxonomy rows grouped by category. */
  taxonomy: Record<TaxonomyCategory, TaxonomyRow[]>;
  /** Flat list of value strings for a given category. */
  values: (category: TaxonomyCategory) => string[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useTaxonomyOptions(): UseTaxonomyOptionsResult {
  const [taxonomy, setTaxonomy] = useState<
    Record<TaxonomyCategory, TaxonomyRow[]>
  >({} as Record<TaxonomyCategory, TaxonomyRow[]>);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllTaxonomy();
      setTaxonomy(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت گزینه‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const values = useCallback(
    (category: TaxonomyCategory) =>
      (taxonomy[category] ?? []).map((r) => r.value),
    [taxonomy],
  );

  return { taxonomy, values, loading, error, refresh: load };
}
