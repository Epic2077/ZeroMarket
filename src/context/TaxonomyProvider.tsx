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

export type TaxonomyChangeAction = "add" | "remove" | "rename";

export interface TaxonomyChangeRequest {
  id: string;
  category: TaxonomyCategory;
  action: TaxonomyChangeAction;
  value: string;
  newValue?: string;
  requestedBy: "admin" | "owner";
  status: "pending";
}

interface TaxonomyContextValue {
  taxonomy: TaxonomyState;
  addOption: (category: TaxonomyCategory, value: string) => boolean;
  removeOption: (category: TaxonomyCategory, value: string) => void;
  renameOption: (
    category: TaxonomyCategory,
    oldValue: string,
    newValue: string,
  ) => boolean;
  pendingChanges: TaxonomyChangeRequest[];
  submitChange: (
    request: Omit<TaxonomyChangeRequest, "id" | "status">,
  ) => string;
  approveChange: (id: string) => boolean;
  rejectChange: (id: string) => void;
}

const TaxonomyContext = createContext<TaxonomyContextValue | null>(null);

export function TaxonomyProvider({ children }: { children: ReactNode }) {
  const [taxonomy, setTaxonomy] = useState<TaxonomyState>(initialTaxonomy);
  const [pendingChanges, setPendingChanges] = useState<TaxonomyChangeRequest[]>(
    [],
  );
  const [changeSeq, setChangeSeq] = useState(0);

  const nextChangeId = () =>
    `tax-change-${String(changeSeq + 1).padStart(3, "0")}`;

  const applyChange = useCallback(
    (request: Omit<TaxonomyChangeRequest, "id" | "status">): boolean => {
      if (request.action === "add") {
        const trimmed = request.value.trim();
        if (!trimmed) return false;
        let added = false;
        setTaxonomy((prev) => {
          const exists = prev[request.category].some(
            (v) => v.toLowerCase() === trimmed.toLowerCase(),
          );
          if (exists) return prev;
          added = true;
          return {
            ...prev,
            [request.category]: [...prev[request.category], trimmed],
          };
        });
        return added;
      }

      if (request.action === "remove") {
        setTaxonomy((prev) => ({
          ...prev,
          [request.category]: prev[request.category].filter(
            (v) => v !== request.value,
          ),
        }));
        return true;
      }

      const trimmed = request.newValue?.trim();
      if (!trimmed) return false;
      setTaxonomy((prev) => ({
        ...prev,
        [request.category]: prev[request.category].map((v) =>
          v === request.value ? trimmed : v,
        ),
      }));
      return true;
    },
    [],
  );

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

  const submitChange = useCallback(
    (request: Omit<TaxonomyChangeRequest, "id" | "status">): string => {
      const id = `tax-change-${String(changeSeq + 1).padStart(3, "0")}`;
      setChangeSeq((prev) => prev + 1);
      setPendingChanges((prev) => [...prev, { ...request, id, status: "pending" }]);
      return id;
    },
    [changeSeq],
  );

  const approveChange = useCallback(
    (id: string): boolean => {
      let approved = false;
      setPendingChanges((prev) =>
        prev.filter((request) => {
          if (request.id !== id) return true;
          approved = applyChange(request);
          return false;
        }),
      );
      return approved;
    },
    [applyChange],
  );

  const rejectChange = useCallback((id: string) => {
    setPendingChanges((prev) => prev.filter((request) => request.id !== id));
  }, []);

  const value = useMemo<TaxonomyContextValue>(
    () => ({
      taxonomy,
      addOption,
      removeOption,
      renameOption,
      pendingChanges,
      submitChange,
      approveChange,
      rejectChange,
    }),
    [
      taxonomy,
      addOption,
      removeOption,
      renameOption,
      pendingChanges,
      submitChange,
      approveChange,
      rejectChange,
    ],
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
