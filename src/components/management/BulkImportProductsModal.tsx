"use client";

import { toFa } from "@/context/carLabels";
import { useTaxonomyOptions } from "@/hooks/useTaxonomyOptions";
import type { ProductInput } from "@/types/admin";
import { Download, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useUserInfo } from "@/context/UserInfoProvider";

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

export default function BulkImportProductsModal({
  sellerName,
  onImport,
  onClose,
}: Props) {
  const { values } = useTaxonomyOptions();
  const { session } = useUserInfo();

  const brands = values("BRAND");
  const colors = values("COLOR");
  const transmissions = values("TRANSMISSION");
  const fuelTypes = values("FUEL_TYPE");
  const bodyTypes = values("BODY_TYPE");
  const cities = values("CITY");
  const [file, setFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getAuthHeaders = () => {
    const headers = new Headers();
    if (session?.access_token) {
      headers.set("Authorization", `Bearer ${session.access_token}`);
    }
    return headers;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setErrors([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const downloadTemplate = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/excel/export", {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error ?? `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Listings_Template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("قالب اکسل دانلود شد");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در دانلود فایل");
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("لطفاً ابتدا فایل اکسل تکمیل شده را انتخاب کنید");
      return;
    }

    setUploading(true);
    setErrors([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/excel/import", {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.errors && Array.isArray(result.errors)) {
          setErrors(result.errors);
        } else {
          throw new Error(result.error ?? `HTTP ${res.status}`);
        }
        return;
      }

      if (result.success) {
        toast.success(result.message ?? "آگهی‌ها با موفقیت ثبت شدند");
        onClose();
      } else if (result.errors) {
        setErrors(result.errors);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در بارگذاری فایل");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
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
            disabled={downloading}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-primary/30 bg-primary/5 text-primary text-sm font-700 hover:bg-primary/10 transition-colors duration-150 disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Download size={15} />
            )}
            {downloading ? "در حال آماده‌سازی…" : "دانلود قالب اکسل"}
          </button>

          <div
            onClick={() => inputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-2 w-full py-6 rounded-xl border-2 border-dashed transition-colors duration-150 cursor-pointer text-center ${
              dragActive
                ? "border-primary bg-primary/5"
                : file
                ? "border-primary/40 bg-primary/5"
                : "border-border hover:border-primary/40 hover:bg-muted/30"
            }`}
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
              <div className="flex items-center gap-2 w-full max-w-xs">
                <span className="text-sm font-600 text-foreground truncate flex-1">
                  {file.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors duration-150"
                  aria-label="حذف فایل"
                >
                  <X size={16} />
                </button>
              </div>
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

        {errors.length > 0 && (
          <div className="p-3 bg-danger/5 border border-danger/20 rounded-xl text-xs text-danger max-h-40 overflow-y-auto">
            <p className="font-700 mb-1">
              لطفاً خطاهای زیر را در فایل اصلاح کنید:
            </p>
            <ul className="list-disc pr-5 space-y-0.5">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
          <button onClick={onClose} className="btn-secondary text-sm">
            انصراف
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            {uploading ? "در حال بارگذاری…" : "بارگذاری و افزودن"}
          </button>
        </div>
      </div>
    </div>
  );
}
