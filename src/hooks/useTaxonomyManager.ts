"use client";

import { useCallback, useState } from "react";
import { useSession } from "@/context/SessionProvider";
import { useUserInfo } from "@/context/UserInfoProvider";
import { useTaxonomyOptions } from "@/hooks/useTaxonomyOptions";
import {
  fetchModelsGroupedByBrand,
  ownerAddOption,
  ownerDeleteOption,
  ownerRenameOption,
  requestTaxonomyChange,
  type TaxonomyCategory,
  type TaxonomyRow,
} from "@/lib/supabase/taxonomy";
import { toast } from "sonner";

interface UseTaxonomyManagerReturn {
  taxonomy: Record<TaxonomyCategory, TaxonomyRow[]>;
  values: (cat: TaxonomyCategory) => string[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  active: TaxonomyCategory;
  setActive: (cat: TaxonomyCategory) => void;
  draft: string;
  setDraft: (v: string) => void;
  saving: boolean;
  expandedBrands: Set<string>;
  setExpandedBrands: React.Dispatch<React.SetStateAction<Set<string>>>;
  modelsByBrand: Record<string, string[]>;
  modelsLoading: boolean;
  modelDrafts: Record<string, string>;
  setModelDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  canEdit: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  handleAdd: () => Promise<void>;
  handleRemove: (value: string, category?: TaxonomyCategory) => Promise<void>;
  handleRename: (oldValue: string, newValue: string, category?: TaxonomyCategory) => Promise<void>;
  handleAddModel: (brand: string) => Promise<void>;
  loadModels: () => Promise<void>;
  toggleBrand: (brand: string) => void;
}

export function useTaxonomyManager(): UseTaxonomyManagerReturn {
  const { taxonomy, values, loading, error, refresh } = useTaxonomyOptions();
  const { role } = useSession();
  const { user } = useUserInfo();
  
  const [active, setActive] = useState<TaxonomyCategory>("BRAND");
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [modelsByBrand, setModelsByBrand] = useState<Record<string, string[]>>({});
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelDrafts, setModelDrafts] = useState<Record<string, string>>({});

  const isOwner = role === "owner";
  const isAdmin = role === "admin";
  const canEdit = isOwner || isAdmin;

  const loadModels = useCallback(async () => {
    setModelsLoading(true);
    try {
      const grouped = await fetchModelsGroupedByBrand();
      setModelsByBrand(grouped);
    } catch {
      setModelsByBrand({});
    } finally {
      setModelsLoading(false);
    }
  }, []);

  const toggleBrand = useCallback((brand: string) => {
    setExpandedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) {
        next.delete(brand);
      } else {
        next.add(brand);
        if (Object.keys(modelsByBrand).length === 0) loadModels();
      }
      return next;
    });
  }, [modelsByBrand, loadModels]);

  const handleAdd = useCallback(async () => {
    const value = draft.trim();
    if (!value) return;
    setSaving(true);
    try {
      if (isOwner) {
        const metadata = active === "COLOR" ? { hex: "#1b4fd8" } : null;
        await ownerAddOption({ category: active, value, metadata });
        toast.success(`«${value}» افزوده شد`);
      } else {
        await requestTaxonomyChange({
          category: active,
          action: "ADD",
          value,
          metadata: active === "COLOR" ? { hex: "#1b4fd8" } : null,
          requestedBy: user?.id ?? "",
        });
        toast.success("درخواست افزودن برای تایید مالک ثبت شد");
      }
      setDraft("");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در افزودن");
    } finally {
      setSaving(false);
    }
  }, [active, draft, isOwner, user, refresh]);

  const handleRemove = useCallback(async (value: string, category?: TaxonomyCategory) => {
    setSaving(true);
    try {
      const cat = category ?? active;
      if (isOwner) {
        await ownerDeleteOption(cat, value);
        toast.success(`«${value}» حذف شد`);
      } else {
        await requestTaxonomyChange({
          category: cat,
          action: "DELETE",
          value,
          requestedBy: user?.id ?? "",
        });
        toast.success("درخواست حذف برای تایید مالک ثبت شد");
      }
      refresh();
      loadModels();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در حذف");
    } finally {
      setSaving(false);
    }
  }, [active, isOwner, user, refresh, loadModels]);

  const handleRename = useCallback(async (
    oldValue: string,
    newValue: string,
    category?: TaxonomyCategory,
  ) => {
    const cat = category ?? active;
    if (isOwner) {
      await ownerRenameOption(cat, oldValue, newValue);
    } else {
      await requestTaxonomyChange({
        category: cat,
        action: "UPDATE",
        value: oldValue,
        newValue,
        requestedBy: user?.id ?? "",
      });
      toast.success("درخواست ویرایش برای تایید مالک ثبت شد");
    }
    refresh();
    loadModels();
  }, [active, isOwner, user, refresh, loadModels]);

  const handleAddModel = useCallback(async (brand: string) => {
    const value = (modelDrafts[brand] ?? "").trim();
    if (!value) return;
    setSaving(true);
    try {
      if (isOwner) {
        await ownerAddOption({
          category: "MODEL",
          value,
          metadata: { brand },
        });
        toast.success(`«${value}» به «${brand}» افزوده شد`);
      } else {
        await requestTaxonomyChange({
          category: "MODEL",
          action: "ADD",
          value,
          metadata: { brand },
          requestedBy: user?.id ?? "",
        });
        toast.success("درخواست افزودن مدل برای تایید مالک ثبت شد");
      }
      setModelDrafts((prev) => ({ ...prev, [brand]: "" }));
      loadModels();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در افزودن مدل");
    } finally {
      setSaving(false);
    }
  }, [modelDrafts, isOwner, user, loadModels]);

  return {
    taxonomy,
    values,
    loading,
    error,
    refresh,
    active,
    setActive,
    draft,
    setDraft,
    saving,
    expandedBrands,
    setExpandedBrands,
    modelsByBrand,
    modelsLoading,
    modelDrafts,
    setModelDrafts,
    canEdit,
    isOwner,
    isAdmin,
    handleAdd,
    handleRemove,
    handleRename,
    handleAddModel,
    loadModels,
    toggleBrand,
  };
}