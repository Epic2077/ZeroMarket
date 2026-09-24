"use client";

import { Car } from "lucide-react";
import { SearchSelect } from "@/components/shared/SearchSelect";
import { Section } from "@/components/shared/Section";
import { Controller, type Control, type FieldErrors, useFormContext } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import { fetchModelsByBrand } from "@/lib/supabase/taxonomy";
import { useTaxonomyOptions } from "@/hooks/useTaxonomyOptions";
import type { VehicleRequestFormValues } from "@/lib/validation/vehicleRequest";

interface VehicleRequestStepVehicleProps {
  control: Control<VehicleRequestFormValues>;
  errors: FieldErrors<VehicleRequestFormValues>;
  preselectedBrand?: string;
  preselectedModel?: string;
}

export function VehicleRequestStepVehicle({
  control,
  errors,
  preselectedBrand,
  preselectedModel,
}: VehicleRequestStepVehicleProps) {
  const { values: taxonomyValues, loading: taxonomyLoading } = useTaxonomyOptions();
  const [modelValues, setModelValues] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(preselectedBrand ?? "");
  const [selectedModel, setSelectedModel] = useState(preselectedModel ?? "");

  const brandOptions = taxonomyValues("BRAND");

  const { setValue } = useFormContext<VehicleRequestFormValues>();

  useEffect(() => {
    if (preselectedBrand && !selectedBrand) {
      setSelectedBrand(preselectedBrand);
    }
  }, [preselectedBrand, selectedBrand]);

  useEffect(() => {
    if (preselectedModel && !selectedModel) {
      setSelectedModel(preselectedModel);
    }
  }, [preselectedModel, selectedModel]);

  const handleBrandChange = useCallback(
    (value: string) => {
      setSelectedBrand(value);
      setSelectedModel("");
      setValue("brand", value, { shouldValidate: true });
      setValue("model", "", { shouldValidate: true });
    },
    [setValue]
  );

  const handleModelChange = useCallback(
    (value: string) => {
      setSelectedModel(value);
      setValue("model", value, { shouldValidate: true });
    },
    [setValue]
  );

  useEffect(() => {
    let cancelled = false;
    if (!selectedBrand) {
      setModelValues([]);
      return;
    }
    setModelsLoading(true);
    fetchModelsByBrand(selectedBrand)
      .then((rows) => {
        if (cancelled) return;
        setModelValues(rows.map((r) => r.value));
      })
      .catch(() => {
        if (cancelled) return;
        setModelValues([]);
      })
      .finally(() => {
        if (!cancelled) setModelsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBrand]);

  const displayModelValues = selectedBrand ? modelValues : [];

  if (taxonomyLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        <span className="animate-spin inline-block mr-2">⏳</span>
        در حال بارگذاری برندها…
      </div>
    );
  }

  return (
    <Section
      icon={<Car size={16} className="text-primary" />}
      title="انتخاب خودرو"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          control={control}
          name="brand"
          render={({ field }) => (
            <SearchSelect
              id="vr-brand"
              label="برند"
              value={field.value ?? ""}
              options={brandOptions}
              placeholder="انتخاب برند"
              onChange={handleBrandChange}
              loading={taxonomyLoading}
              emptyText="برندی یافت نشد"
            />
          )}
        />
        {errors.brand && (
          <p className="text-sm text-danger col-span-2">{errors.brand.message}</p>
        )}

        <Controller
          control={control}
          name="model"
          render={({ field }) => (
            <SearchSelect
              id="vr-model"
              label="مدل"
              value={field.value ?? ""}
              options={displayModelValues}
              placeholder={
                modelsLoading
                  ? "در حال بارگذاری…"
                  : !selectedBrand
                    ? "ابتدا برند را انتخاب کنید"
                    : displayModelValues.length === 0
                      ? "مدلی یافت نشد"
                      : "انتخاب مدل"
              }
              emptyText="مدلی یافت نشد"
              loading={modelsLoading}
              disabled={!selectedBrand || modelsLoading}
              onChange={handleModelChange}
            />
          )}
        />
        {errors.model && (
          <p className="text-sm text-danger col-span-2">{errors.model.message}</p>
        )}
      </div>
    </Section>
  );
}