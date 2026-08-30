"use client";

import { Download, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useUserInfo } from "@/context/UserInfoProvider";

interface Props {
  onClose: () => void;
}

const steps = [
  {
    n: "۱",
    title: "دانلود قالب اکسل",
    desc: "ابتدا قالب اکسل را دانلود کنید.",
  },
  {
    n: "۲",
    title: "تکمیل قالب",
    desc: "اطلاعات خودروها را بر اساس ستون‌های قالب وارد کنید — هر ردیف یک آگهی است.",
  },
  {
    n: "۳",
    title: "بارگذاری فایل",
    desc: "فایل تکمیل‌شده را اینجا بارگذاری کنید تا همه آگهی‌ها هم‌زمان افزوده شوند.",
  },
];

export default function BulkImportModal({ onClose }: Props) {
  const { session } = useUserInfo();
  const [file, setFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = async () => {
    setDownloading(true);
    try {
      const fnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-excel-template`;
      const res = await fetch(fnUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Listings_Template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
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
      const fnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/import-listings`;
      const res = await fetch(fnUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error ?? `HTTP ${res.status}`);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 vazir-matn"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="ورود گروهی آگهی‌ها"
    >
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-800 text-foreground">
            ورود گروهی آگهی‌ها
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors duration-150"
            aria-label="بستن"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            برای افزودن چند آگهی به‌صورت هم‌زمان، مراحل زیر را دنبال کنید:
          </p>

          {/* Steps */}
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

          {/* Download template */}
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

          {/* Upload dropzone */}
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

        {/* Validation errors */}
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

        {/* Footer */}
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
