"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaxonomyOptions } from "@/hooks/useTaxonomyOptions";
import { fetchModelsByBrand } from "@/lib/supabase/taxonomy";
import { createPriceAlert } from "@/lib/supabase/priceAlerts";
import { useUserInfo } from "@/context/UserInfoProvider";
import { requiredText } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const alertSchema = z.object({
  brand: requiredText("برند را انتخاب کنید"),
  model: requiredText("مدل را انتخاب کنید"),
  year: z.string().optional(),
  targetPrice: z
    .string()
    .trim()
    .min(1, "قیمت هدف را وارد کنید")
    .refine((v) => Number(v.replace(/\D/g, "")) > 0, "قیمت هدف نامعتبر است"),
});

type AlertValues = z.infer<typeof alertSchema>;

function SearchablePicker({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  searchPlaceholder: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) =>
      option.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (open) {
            setOpen(false);
            return;
          }
          setQuery("");
          setOpen(true);
        }}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-border bg-card px-2.5 text-sm text-foreground transition-colors hover:bg-muted/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} className="text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="border-b border-border p-2">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2.5">
              <Search size={14} className="text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="w-full rounded-lg px-3 py-2 text-right text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              بدون انتخاب
            </button>
            {filtered.length ? (
              filtered.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-right text-sm transition-colors hover:bg-muted ${
                    option === value
                      ? "bg-primary/10 text-primary"
                      : "text-foreground"
                  }`}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                موردی یافت نشد
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewPriceAlertModal({ onClose, onCreated }: Props) {
  const { user } = useUserInfo();
  const { values: taxonomyValues } = useTaxonomyOptions();
  const brandOptions = useMemo(() => taxonomyValues("BRAND"), [taxonomyValues]);
  const yearOptions = useMemo(() => taxonomyValues("YEAR"), [taxonomyValues]);

  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  const {
    handleSubmit,
    control,
    setValue,
    register,
    formState: { errors, isSubmitting },
  } = useForm<AlertValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: { brand: "", model: "", year: "", targetPrice: "" },
  });

  const selectedBrand = useWatch({ control, name: "brand" });

  // Load models when brand changes.
  useEffect(() => {
    if (!selectedBrand) {
      setModelOptions([]);
      return;
    }
    let cancelled = false;
    setModelsLoading(true);
    fetchModelsByBrand(selectedBrand)
      .then((rows) => {
        if (!cancelled) setModelOptions(rows.map((r) => r.value));
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
  }, [selectedBrand]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const submit = handleSubmit(async (values) => {
    if (!user?.id) {
      toast.error("ابتدا وارد حساب کاربری خود شوید");
      return;
    }
    try {
      await createPriceAlert({
        userId: user.id,
        brand: values.brand,
        model: values.model,
        year: values.year ? Number(values.year) : null,
        targetPrice: Number(values.targetPrice.replace(/\D/g, "")),
      });
      toast.success("هشدار قیمت جدید ثبت شد");
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در ثبت هشدار");
    }
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 vazir-matn"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="ثبت هشدار قیمت جدید"
    >
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <form
        onSubmit={submit}
        noValidate
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-800 text-foreground">
              ثبت هشدار جدید
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              برند، مدل و قیمت هدف را وارد کنید تا هنگام رسیدن قیمت، مطلع شوید.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-muted"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 px-5 py-4">
          <label className="flex flex-col gap-1.5 text-xs font-600 text-muted-foreground">
            برند خودرو
            <Controller
              control={control}
              name="brand"
              render={({ field }) => (
                <SearchablePicker
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    setValue("model", "");
                  }}
                  options={brandOptions}
                  placeholder="انتخاب برند"
                  searchPlaceholder="جستجوی برند"
                />
              )}
            />
            {errors.brand?.message && (
              <span className="text-xs text-danger">
                {errors.brand.message}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-600 text-muted-foreground">
            مدل
            <Controller
              control={control}
              name="model"
              render={({ field }) => (
                <SearchablePicker
                  value={field.value}
                  onChange={field.onChange}
                  options={modelOptions}
                  placeholder={
                    modelsLoading ? "در حال بارگذاری…" : "انتخاب مدل"
                  }
                  searchPlaceholder="جستجوی مدل"
                  disabled={!selectedBrand || modelsLoading}
                />
              )}
            />
            {errors.model?.message && (
              <span className="text-xs text-danger">
                {errors.model.message}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-600 text-muted-foreground">
            سال (اختیاری)
            <Controller
              control={control}
              name="year"
              render={({ field }) => (
                <Select
                  dir="rtl"
                  value={field.value || undefined}
                  onValueChange={(value) =>
                    field.onChange(value === "__none__" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="همه سال‌ها" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">همه سال‌ها</SelectItem>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-600 text-muted-foreground">
            قیمت هدف (تومان)
            <Input
              {...register("targetPrice", {
                onChange: (e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  setValue(
                    "targetPrice",
                    digits ? Number(digits).toLocaleString("en-US") : "",
                    {
                      shouldValidate: true,
                    },
                  );
                },
              })}
              inputMode="numeric"
              dir="ltr"
              className="text-right font-mono"
              placeholder="2,700,000,000"
            />
            {errors.targetPrice?.message && (
              <span className="text-xs text-danger">
                {errors.targetPrice.message}
              </span>
            )}
          </label>

          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            وقتی آگهی مطابق با برند و مدل شما ثبت شود و قیمت به هدف شما برسد،
            اعلان دریافت می‌کنید.
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-sm"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary text-sm flex items-center gap-2"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            ثبت هشدار
          </button>
        </div>
      </form>
    </div>
  );
}
