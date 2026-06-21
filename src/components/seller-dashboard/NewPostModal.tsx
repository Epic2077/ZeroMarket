"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/context/data";
import {
  bodyTypeOptions,
  brandOptions,
  cityOptions,
  fuelTypeOptions,
  statusOptions,
  type SelectOption,
} from "@/context/marketFilters";
import {
  colorOptions,
  modelOptions,
  suggestedPrice,
  transmissionOptions,
  yearOptions,
} from "@/context/newPostForm";
import { Sparkles, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
}

const emptyForm = {
  brand: "",
  model: "",
  year: "",
  bodyType: "",
  fuelType: "",
  transmission: "",
  color: "",
  city: "",
  status: "active",
  price: "",
};

type FormState = typeof emptyForm;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-600 text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function FormSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder: string;
}) {
  return (
    <Select dir="rtl" value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="w-full h-9 text-sm vazir-matn">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function NewPostModal({ onClose }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const suggestion = form.brand ? suggestedPrice(form.brand) : null;

  const handleSubmit = () => {
    if (!form.brand || !form.model || !form.price) {
      toast.error("لطفاً برند، مدل و قیمت را وارد کنید");
      return;
    }
    toast.success("آگهی جدید ثبت شد");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 vazir-matn"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="ثبت آگهی جدید"
    >
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-800 text-foreground">ثبت آگهی جدید</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors duration-150"
            aria-label="بستن"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="برند">
            <FormSelect
              value={form.brand}
              onChange={(v) => {
                set("brand", v);
                set("model", "");
              }}
              options={brandOptions}
              placeholder="انتخاب برند"
            />
          </Field>
          <Field label="مدل">
            <FormSelect
              value={form.model}
              onChange={(v) => set("model", v)}
              options={modelOptions(form.brand)}
              placeholder="انتخاب مدل"
            />
          </Field>
          <Field label="سال تولید">
            <FormSelect
              value={form.year}
              onChange={(v) => set("year", v)}
              options={yearOptions}
              placeholder="انتخاب سال"
            />
          </Field>
          <Field label="نوع بدنه">
            <FormSelect
              value={form.bodyType}
              onChange={(v) => set("bodyType", v)}
              options={bodyTypeOptions}
              placeholder="انتخاب بدنه"
            />
          </Field>
          <Field label="سوخت">
            <FormSelect
              value={form.fuelType}
              onChange={(v) => set("fuelType", v)}
              options={fuelTypeOptions}
              placeholder="انتخاب سوخت"
            />
          </Field>
          <Field label="گیربکس">
            <FormSelect
              value={form.transmission}
              onChange={(v) => set("transmission", v)}
              options={transmissionOptions}
              placeholder="انتخاب گیربکس"
            />
          </Field>
          <Field label="رنگ">
            <FormSelect
              value={form.color}
              onChange={(v) => set("color", v)}
              options={colorOptions}
              placeholder="انتخاب رنگ"
            />
          </Field>
          <Field label="شهر">
            <FormSelect
              value={form.city}
              onChange={(v) => set("city", v)}
              options={cityOptions}
              placeholder="انتخاب شهر"
            />
          </Field>
          <Field label="وضعیت">
            <FormSelect
              value={form.status}
              onChange={(v) => set("status", v)}
              options={statusOptions}
              placeholder="انتخاب وضعیت"
            />
          </Field>

          {/* Price + market suggestion */}
          <div className="sm:col-span-2">
            <Field label="قیمت (تومان)">
              <input
                type="number"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="مبلغ را وارد کنید"
                className="w-full h-9 rounded-lg border border-border bg-card px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>
            {suggestion != null ? (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
                <span className="flex items-center gap-1.5 text-xs text-foreground">
                  <Sparkles size={13} className="text-primary" />
                  قیمت پیشنهادی بازار:{" "}
                  <span className="font-mono font-700">
                    {formatPrice(suggestion)} تومان
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => set("price", String(suggestion))}
                  className="text-xs font-700 text-primary hover:underline"
                >
                  اعمال
                </button>
              </div>
            ) : (
              form.brand && (
                <p className="mt-2 text-2xs text-muted-foreground">
                  برای این برند داده‌ای برای تحلیل قیمت موجود نیست.
                </p>
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border shrink-0">
          <button onClick={onClose} className="btn-secondary text-sm">
            انصراف
          </button>
          <button onClick={handleSubmit} className="btn-primary text-sm">
            ثبت آگهی
          </button>
        </div>
      </div>
    </div>
  );
}
