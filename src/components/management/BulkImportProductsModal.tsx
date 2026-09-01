"use client";

import { toFa } from "@/context/carLabels";
import { useTaxonomyOptions } from "@/hooks/useTaxonomyOptions";
import type { ProductInput } from "@/types/admin";
import { Download, FileSpreadsheet, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  sellerName: string;
  onImport: (rows: ProductInput[]) => void;
  onClose: () => void;
}

const TEMPLATE_COLUMNS = [
  "برند",
  "مدل",
  "تریم",
  "سال",
  "رنگ",
  "نوع بدنه",
  "سوخت",
  "گیربکس",
  "شهر",
  "قیمت (تومان)",
  "وضعیت",
];

const steps = [
  { n: "۱", title: "دانلود قالب", desc: "قالب اکسل را دانلود کنید." },
  {
    n: "۲",
    title: "تکمیل ردیف‌ها",
    desc: "هر ردیف یک محصول است؛ ستون‌ها را مطابق گزینه‌های مجاز پر کنید.",
  },
  {
    n: "۳",
    title: "بارگذاری",
    desc: "فایل را بارگذاری کنید تا محصولات برای این فروشنده افزوده شوند.",
  },
];

// Mock Excel import: no parser, so a successful upload synthesizes a few full
// product rows from the current taxonomy to demonstrate the flow.
export default function BulkImportProductsModal({
  sellerName,
  onImport,
  onClose,
}: Props) {
  const { values } = useTaxonomyOptions();

  const brands = values("BRAND");
  const colors = values("COLOR");
  const transmissions = values("TRANSMISSION");
  const fuelTypes = values("FUEL_TYPE");
  const bodyTypes = values("BODY_TYPE");
  const cities = values("CITY");
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csv = "﻿" + TEMPLATE_COLUMNS.join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "KhodroJu-products-template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("قالب اکسل دانلود شد");
  };

  const handleUpload = () => {
    if (!file) {
      toast.error("لطفاً ابتدا فایل اکسل تکمیل شده را انتخاب کنید");
      return;
    }
    const base = file.name.replace(/\.[^.]+$/, "");
    const rows: ProductInput[] = Array.from({ length: 4 }).map((_, i) => ({
      brand: brands[i % brands.length] ?? "خودرو",
      model: `${base}-${toFa(i + 1)}`,
      trim: "استاندارد",
      year: 2026,
      color: colors[i % colors.length] ?? "سفید",
      colorHex: "#1b4fd8",
      engine: "۲.۰ لیتر",
      transmission: transmissions[0] ?? "اتوماتیک",
      fuelType: fuelTypes[0] ?? "بنزینی",
      bodyType: bodyTypes[i % bodyTypes.length] ?? "سدان",
      city: cities[i % cities.length] ?? "تهران",
      deliveryDays: 7,
      price: 1_500_000_000 + i * 100_000_000,
      status: "active",
      factoryOptions: [],
    }));
    onImport(rows);
    toast.success(`${toFa(rows.length)} محصول برای «${sellerName}» افزوده شد`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 vazir-matn"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="ورود گروهی محصولات"
    >
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-800 text-foreground">
            ورود گروهی محصولات — {sellerName}
          </h2>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors duration-150"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {steps.map((s) => (
              <div key={s.n} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-800 text-xs flex items-center justify-center shrink-0">
                  {s.n}
                </div>
                <div>
                  <div className="text-sm font-700 text-foreground">
                    {s.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {s.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={downloadTemplate}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-primary/30 bg-primary/5 text-primary text-sm font-700 hover:bg-primary/10 transition-colors duration-150"
          >
            <Download size={15} />
            دانلود قالب اکسل
          </button>

          <div
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 w-full py-6 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/30 transition-colors duration-150 cursor-pointer text-center"
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <FileSpreadsheet size={24} className="text-muted-foreground" />
            {file ? (
              <span className="text-sm font-600 text-foreground">
                {file.name}
              </span>
            ) : (
              <>
                <span className="text-sm font-600 text-foreground">
                  فایل اکسل تکمیل شده را اینجا بکشید یا کلیک کنید
                </span>
                <span className="text-2xs text-muted-foreground">
                  فرمت‌های مجاز: xlsx، xls، csv
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <button onClick={onClose} className="btn-secondary text-sm">
            انصراف
          </button>
          <button onClick={handleUpload} className="btn-primary text-sm">
            <Upload size={14} />
            بارگذاری و افزودن
          </button>
        </div>
      </div>
    </div>
  );
}
