"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "@/context/SessionProvider";
import { useUserInfo } from "@/context/UserInfoProvider";
import { useTaxonomyOptions } from "@/hooks/useTaxonomyOptions";
import { fetchModelsByBrand } from "@/lib/supabase/taxonomy";
import {
  fetchAllCarSpecs,
  ownerUpsertCarSpec,
  ownerDeleteCarSpec,
  requestCarSpecChange,
  type CarSpecRow,
  type CarSpecInput,
} from "@/lib/supabase/carSpecs";
import { toast } from "sonner";

/** A spec entry grouped under a model. */
export interface SpecEntry {
  id: string;
  year: string | null;
  engine: string;
  transmission: string;
  fuelType: string;
  bodyType: string;
}

/** Models grouped under a brand, each with their spec entries. */
export interface BrandSpecGroup {
  brand: string;
  models: ModelSpecGroup[];
}

export interface ModelSpecGroup {
  model: string;
  specs: SpecEntry[];
}

interface UseCarSpecsManagerReturn {
  /** Brand → Model → Specs grouped structure. */
  grouped: BrandSpecGroup[];
  /** Flat list of brand names from taxonomy. */
  brandOptions: string[];
  /** Flat list of year options from taxonomy. */
  yearOptions: string[];
  /** Model options filtered by selected brand (fetched async). */
  modelOptions: string[];
  /** Whether model options are still loading. */
  modelsLoading: boolean;
  /** Flat list of transmission options from taxonomy. */
  transmissionOptions: string[];
  /** Flat list of fuel type options from taxonomy. */
  fuelTypeOptions: string[];
  /** Flat list of body type options from taxonomy. */
  bodyTypeOptions: string[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  canEdit: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  saving: boolean;

  // Accordion state
  expandedBrands: Set<string>;
  toggleBrand: (brand: string) => void;

  // Add / Edit form state
  editingSpec: SpecEntry | null;
  setEditingSpec: (s: SpecEntry | null) => void;
  formBrand: string;
  setFormBrand: (v: string) => void;
  formModel: string;
  setFormModel: (v: string) => void;
  formYear: string;
  setFormYear: (v: string) => void;
  formEngine: string;
  setFormEngine: (v: string) => void;
  formTransmission: string;
  setFormTransmission: (v: string) => void;
  formFuelType: string;
  setFormFuelType: (v: string) => void;
  formBodyType: string;
  setFormBodyType: (v: string) => void;

  // Actions
  handleSaveSpec: () => Promise<void>;
  handleDeleteSpec: (id: string) => Promise<void>;
  resetForm: () => void;
}

export function useCarSpecsManager(): UseCarSpecsManagerReturn {
  const {
    taxonomy,
    values,
    loading: taxLoading,
    error: taxError,
    refresh: refreshTax,
  } = useTaxonomyOptions();
  const { role } = useSession();
  const { user } = useUserInfo();

  const [specs, setSpecs] = useState<CarSpecRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());

  // Form state
  const [editingSpec, setEditingSpec] = useState<SpecEntry | null>(null);
  const [formBrand, setFormBrand] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formYear, setFormYear] = useState("");
  const [formEngine, setFormEngine] = useState("");
  const [formTransmission, setFormTransmission] = useState("");
  const [formFuelType, setFormFuelType] = useState("");
  const [formBodyType, setFormBodyType] = useState("");

  const isOwner = role === "owner";
  const isAdmin = role === "admin";
  const canEdit = isOwner || isAdmin;

  // Derived options from taxonomy
  const brandOptions = useMemo(() => values("BRAND"), [values]);
  const yearOptions = useMemo(() => values("YEAR"), [values]);
  const transmissionOptions = useMemo(() => values("TRANSMISSION"), [values]);
  const fuelTypeOptions = useMemo(() => values("FUEL_TYPE"), [values]);
  const bodyTypeOptions = useMemo(() => values("BODY_TYPE"), [values]);

  // ── Async model fetch when brand changes ──────────────────────────
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!formBrand) {
      setModelOptions([]);
      return;
    }
    setModelsLoading(true);
    fetchModelsByBrand(formBrand)
      .then((rows) => {
        if (cancelled) return;
        const opts = rows.map((r) => r.value);
        // Ensure current formModel is in the list (for edit mode)
        if (formModel && !opts.includes(formModel)) {
          opts.unshift(formModel);
        }
        setModelOptions(opts);
      })
      .catch(() => {
        if (!cancelled) setModelOptions([]);
      })
      .finally(() => {
        if (!cancelled) setModelsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [formBrand, formModel]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllCarSpecs();
      setSpecs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت مشخصات فنی");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(() => {
    void load();
    void refreshTax();
  }, [load, refreshTax]);

  // Group specs: Brand → Model → SpecEntry[]
  const grouped = useMemo((): BrandSpecGroup[] => {
    const brandMap = new Map<string, Map<string, SpecEntry[]>>();

    for (const s of specs) {
      let models = brandMap.get(s.brand);
      if (!models) {
        models = new Map();
        brandMap.set(s.brand, models);
      }
      let entries = models.get(s.model);
      if (!entries) {
        entries = [];
        models.set(s.model, entries);
      }
      entries.push({
        id: s.id,
        year: s.year,
        engine: s.engine,
        transmission: s.transmission,
        fuelType: s.fuel_type,
        bodyType: s.body_type,
      });
    }

    return Array.from(brandMap.entries())
      .map(([brand, models]) => ({
        brand,
        models: Array.from(models.entries())
          .map(([model, specsArr]) => ({
            model,
            specs: specsArr.sort((a, b) => {
              if (a.year === null) return -1;
              if (b.year === null) return 1;
              return b.year.localeCompare(a.year); // newest first
            }),
          }))
          .sort((a, b) => a.model.localeCompare(b.model)),
      }))
      .sort((a, b) => a.brand.localeCompare(b.brand));
  }, [specs]);

  const toggleBrand = useCallback((brand: string) => {
    setExpandedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  }, []);

  const resetForm = useCallback(() => {
    setEditingSpec(null);
    setFormBrand("");
    setFormModel("");
    setFormYear("");
    setFormEngine("");
    setFormTransmission("");
    setFormFuelType("");
    setFormBodyType("");
  }, []);

  const handleSaveSpec = useCallback(async () => {
    if (!formBrand.trim() || !formModel.trim()) {
      toast.error("برند و مدل الزامی است");
      return;
    }
    if (
      !formEngine.trim() ||
      !formTransmission.trim() ||
      !formFuelType.trim() ||
      !formBodyType.trim()
    ) {
      toast.error("تمام مشخصات فنی الزامی است");
      return;
    }

    setSaving(true);
    const input: CarSpecInput = {
      brand: formBrand.trim(),
      model: formModel.trim(),
      year: formYear.trim() || null,
      engine: formEngine.trim(),
      transmission: formTransmission.trim(),
      fuel_type: formFuelType.trim(),
      body_type: formBodyType.trim(),
    };

    try {
      if (isOwner) {
        await ownerUpsertCarSpec(input, editingSpec?.id);
        toast.success(
          editingSpec ? "مشخصات فنی ویرایش شد" : "مشخصات فنی جدید ثبت شد",
        );
      } else {
        await requestCarSpecChange({
          action: editingSpec ? "UPDATE" : "ADD",
          brand: input.brand,
          model: input.model,
          year: input.year,
          engine: input.engine,
          transmission: input.transmission,
          fuel_type: input.fuel_type,
          body_type: input.body_type,
          requestedBy: user?.id ?? "",
        });
        toast.success("درخواست برای تایید مالک ثبت شد");
      }
      resetForm();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  }, [
    formBrand,
    formModel,
    formYear,
    formEngine,
    formTransmission,
    formFuelType,
    formBodyType,
    isOwner,
    editingSpec,
    user,
    resetForm,
    load,
  ]);

  const handleDeleteSpec = useCallback(
    async (id: string) => {
      setSaving(true);
      try {
        const target = specs.find((s) => s.id === id);
        if (!target) {
          setSaving(false);
          return;
        }

        if (isOwner) {
          await ownerDeleteCarSpec(id);
          toast.success("مشخصات فنی حذف شد");
        } else {
          await requestCarSpecChange({
            action: "DELETE",
            brand: target.brand,
            model: target.model,
            year: target.year,
            requestedBy: user?.id ?? "",
          });
          toast.success("درخواست حذف برای تایید مالک ثبت شد");
        }
        if (editingSpec?.id === id) resetForm();
        await load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "خطا در حذف");
      } finally {
        setSaving(false);
      }
    },
    [specs, isOwner, user, editingSpec, resetForm, load],
  );

  return {
    grouped,
    brandOptions,
    yearOptions,
    modelOptions,
    modelsLoading,
    transmissionOptions,
    fuelTypeOptions,
    bodyTypeOptions,
    loading: loading || taxLoading,
    error: error ?? taxError,
    refresh,
    canEdit,
    isOwner,
    isAdmin,
    saving,
    expandedBrands,
    toggleBrand,
    editingSpec,
    setEditingSpec,
    formBrand,
    setFormBrand,
    formModel,
    setFormModel,
    formYear,
    setFormYear,
    formEngine,
    setFormEngine,
    formTransmission,
    setFormTransmission,
    formFuelType,
    setFormFuelType,
    formBodyType,
    setFormBodyType,
    handleSaveSpec,
    handleDeleteSpec,
    resetForm,
  };
}
