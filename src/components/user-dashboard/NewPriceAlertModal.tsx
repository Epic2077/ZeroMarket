"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { colorOptions } from "@/context/newPostForm";
import { brandFa, cityOptions } from "@/context/marketFilters";
import { requiredText } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
  onClose: () => void;
  onCreate: (alert: {
    title: string;
    targetPrice: number;
    currentPrice: number;
    city?: string;
    color?: string;
  }) => void;
}

const brandOptions = Object.values(brandFa);

const alertSchema = z.object({
  title: requiredText("نام آگهی را وارد کنید"),
  targetPrice: z
    .string()
    .trim()
    .min(1, "قیمت هدف را وارد کنید")
    .refine((value) => Number(value) > 0, "قیمت هدف نامعتبر است"),
  currentPrice: z
    .string()
    .trim()
    .min(1, "قیمت فعلی را وارد کنید")
    .refine((value) => Number(value) > 0, "قیمت فعلی نامعتبر است"),
  city: z.string().optional(),
  color: z.string().optional(),
});

type AlertValues = z.infer<typeof alertSchema>;

function SearchablePicker({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  searchPlaceholder: string;
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
        onClick={() => {
          if (open) {
            setOpen(false);
            return;
          }
          setQuery("");
          setOpen(true);
        }}
        className="flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground transition-colors hover:bg-muted/20 focus:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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

export default function NewPriceAlertModal({ onClose, onCreate }: Props) {
  const {
    handleSubmit,
    control,
    register,
    formState: { errors, isSubmitting },
  } = useForm<AlertValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      title: "",
      targetPrice: "",
      currentPrice: "",
      city: "",
      color: "",
    },
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const submit = handleSubmit(async (values) => {
    onCreate({
      title: values.title.trim(),
      targetPrice: Number(values.targetPrice),
      currentPrice: Number(values.currentPrice),
      city: values.city?.trim() || undefined,
      color: values.color?.trim() || undefined,
    });
    toast.success("هشدار قیمت جدید ثبت شد");
    onClose();
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
              برای یک آگهی جدید، قیمت هدف و قیمت فعلی را وارد کنید.
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
              name="title"
              render={({ field }) => (
                <SearchablePicker
                  value={field.value}
                  onChange={field.onChange}
                  options={brandOptions}
                  placeholder="انتخاب برند"
                  searchPlaceholder="جستجوی برند"
                />
              )}
            />
            {errors.title?.message && (
              <span className="text-xs text-danger">
                {errors.title.message}
              </span>
            )}
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-600 text-muted-foreground">
              شهر دلخواه
              <Controller
                control={control}
                name="city"
                render={({ field }) => (
                  <Select
                    dir="rtl"
                    value={field.value || undefined}
                    onValueChange={(value) =>
                      field.onChange(value === "__none__" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="همه شهرها" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">همه شهرها</SelectItem>
                      {cityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.label}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-600 text-muted-foreground">
              رنگ خاص
              <Controller
                control={control}
                name="color"
                render={({ field }) => (
                  <Select
                    dir="rtl"
                    value={field.value || undefined}
                    onValueChange={(value) =>
                      field.onChange(value === "__none__" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="بدون محدودیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">بدون محدودیت</SelectItem>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.label}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-600 text-muted-foreground">
            قیمت هدف (تومان)
            <Input
              {...register("targetPrice")}
              inputMode="numeric"
              placeholder="مثلا 2,700,000,000"
            />
            {errors.targetPrice?.message && (
              <span className="text-xs text-danger">
                {errors.targetPrice.message}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-600 text-muted-foreground">
            قیمت فعلی (تومان)
            <Input
              {...register("currentPrice")}
              inputMode="numeric"
              placeholder="مثلا 2,850,000,000"
            />
            {errors.currentPrice?.message && (
              <span className="text-xs text-danger">
                {errors.currentPrice.message}
              </span>
            )}
          </label>

          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            بعد از ثبت، هشدار در همین تب دیده می‌شود و می‌توانید آن را فعال یا
            غیرفعال کنید. در صورت انتخاب، شهر و رنگ هم در خلاصه هشدار ذخیره
            می‌شوند.
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
            className="btn-primary text-sm"
          >
            ثبت هشدار
          </button>
        </div>
      </form>
    </div>
  );
}
