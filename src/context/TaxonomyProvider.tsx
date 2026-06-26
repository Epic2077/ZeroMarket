"use client";

import {
  initialTaxonomy,
  type TaxonomyCategory,
  type TaxonomyState,
} from "@/context/taxonomy";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface TaxonomyContextValue {
  taxonomy: TaxonomyState;
  addOption: (category: TaxonomyCategory, value: string) => boolean;
  removeOption: (category: TaxonomyCategory, value: string) => void;
  renameOption: (
    category: TaxonomyCategory,
    oldValue: string,
    newValue: string,
  ) => boolean;
}

const TaxonomyContext = createContext<TaxonomyContextValue | null>(null);

export function TaxonomyProvider({ children }: { children: ReactNode }) {
  const [taxonomy, setTaxonomy] = useState<TaxonomyState>(initialTaxonomy);

  // Returns false when the value already exists (case-insensitive, trimmed).
  const addOption = useCallback(
    (category: TaxonomyCategory, value: string): boolean => {
      const trimmed = value.trim();
      if (!trimmed) return false;
      const exists = taxonomy[category].some(
        (v) => v.toLowerCase() === trimmed.toLowerCase(),
      );
      if (exists) return false;
      setTaxonomy((prev) => ({
        ...prev,
        [category]: [...prev[category], trimmed],
      }));
      return true;
    },
    [taxonomy],
  );

  const removeOption = useCallback(
    (category: TaxonomyCategory, value: string) =>
      setTaxonomy((prev) => ({
        ...prev,
        [category]: prev[category].filter((v) => v !== value),
      })),
    [],
  );

  const renameOption = useCallback(
    (
      category: TaxonomyCategory,
      oldValue: string,
      newValue: string,
    ): boolean => {
      const trimmed = newValue.trim();
      if (!trimmed) return false;
      setTaxonomy((prev) => ({
        ...prev,
        [category]: prev[category].map((v) => (v === oldValue ? trimmed : v)),
      }));
      return true;
    },
    [],
  );

  const value = useMemo<TaxonomyContextValue>(
    () => ({ taxonomy, addOption, removeOption, renameOption }),
    [taxonomy, addOption, removeOption, renameOption],
  );

  return (
    <TaxonomyContext.Provider value={value}>
      {children}
    </TaxonomyContext.Provider>
  );
}

export function useTaxonomy(): TaxonomyContextValue {
  const ctx = useContext(TaxonomyContext);
  if (!ctx) {
    throw new Error("useTaxonomy must be used within a <TaxonomyProvider>");
  }
  return ctx;
}
