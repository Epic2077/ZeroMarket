"use client";

import { Car, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SearchSelect } from "@/components/shared/SearchSelect";
import { useTaxonomyOptions } from "@/hooks/useTaxonomyOptions";
import { VehicleRequestModal } from "./VehicleRequestModal";
import { fetchModelsByBrand } from "@/lib/supabase/taxonomy";

interface VehicleRequestWidgetProps {
  className?: string;
  preselectedBrand?: string;
  preselectedModel?: string;
}

export function VehicleRequestWidget({
  className,
  preselectedBrand,
  preselectedModel,
}: VehicleRequestWidgetProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { values: taxonomyValues, loading: taxonomyLoading } =
    useTaxonomyOptions();
  const [brandValue, setBrandValue] = useState(preselectedBrand ?? "");
  const [modelValue, setModelValue] = useState(preselectedModel ?? "");
  const [modelValues, setModelValues] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  const brandOptions = taxonomyValues("BRAND");

  const handleBrandChange = (value: string) => {
    setBrandValue(value);
    setModelValue("");
  };

  const handleModelChange = (value: string) => {
    setModelValue(value);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Fetch models when brand changes (for display in widget)
  useEffect(() => {
    let cancelled = false;
    if (!brandValue) {
      setModelValues([]);
      return;
    }
    setModelsLoading(true);
    fetchModelsByBrand(brandValue)
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
  }, [brandValue]);

  return (
    <div className={`vazir-matn ${className ?? ""}`}>
      <VehicleRequestModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        preselectedBrand={brandValue || preselectedBrand}
        preselectedModel={modelValue || preselectedModel}
      />

      <div className="card-elevated p-4 md:p-6">
        <div className="flex items-center gap-2 text-primary mb-4">
          <Car size={20} />
          <h3 className="text-lg font-800 text-foreground">
            ثبت نام خودرو مورد نظر
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          برند و مدل مورد نظر خود را انتخاب کنید تا درخواست ثبت نام شما ثبت شود
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <SearchSelect
            id="widget-brand"
            label="برند"
            value={brandValue}
            options={brandOptions}
            placeholder="انتخاب برند"
            onChange={handleBrandChange}
            loading={taxonomyLoading}
            emptyText="برندی یافت نشد"
            disabled={taxonomyLoading}
          />

          <SearchSelect
            id="widget-model"
            label="مدل"
            value={modelValue}
            options={modelValues}
            placeholder={
              modelsLoading
                ? "در حال بارگذاری…"
                : !brandValue
                  ? "ابتدا برند را انتخاب کنید"
                  : modelValues.length === 0
                    ? "مدلی یافت نشد"
                    : "انتخاب مدل"
            }
            emptyText="مدلی یافت نشد"
            loading={modelsLoading}
            disabled={!brandValue || modelsLoading}
            onChange={handleModelChange}
          />
        </div>

        <Button
          onClick={handleOpenModal}
          disabled={!brandValue || !modelValue || taxonomyLoading}
          className="w-full justify-center gap-2"
          size="lg"
        >
          <Search size={18} />
          <span>
            درخواست خرید{" "}
            {brandValue && modelValue && ` ${brandValue} ${modelValue}`}
          </span>
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-3">
          رزرو بدون هزینه &nbsp;|&nbsp; تیم ما با شما تماس می‌گیرد
        </p>
      </div>
    </div>
  );
}
