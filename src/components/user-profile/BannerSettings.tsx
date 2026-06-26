"use client";

import { useBanners } from "@/context/BannerProvider";
import {
  CURRENT_SELLER_SLUG,
  bannerPresets,
  isCustomImage,
} from "@/context/banners";
import { Check, ImageIcon, RotateCcw, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

// Max source file we'll accept before downscaling (guards against huge uploads).
const MAX_FILE_BYTES = 6 * 1024 * 1024;
// Banners are wide and low; cap the stored width so localStorage stays small.
const MAX_WIDTH = 1280;

// Read an image file and re-encode it downscaled to a compact JPEG data URL.
function fileToBanner(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        const scale = Math.min(1, MAX_WIDTH / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas unavailable"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function BannerSettings() {
  const { banners, setBanner, resetBanner, getBackground } = useBanners();
  const fileRef = useRef<HTMLInputElement>(null);

  const value = banners[CURRENT_SELLER_SLUG];
  const preview = getBackground(CURRENT_SELLER_SLUG);
  const customActive = isCustomImage(value);

  const choosePreset = (id: string) => {
    setBanner(CURRENT_SELLER_SLUG, id);
    toast.success("بنر نمایشگاه به‌روزرسانی شد");
  };

  const reset = () => {
    resetBanner(CURRENT_SELLER_SLUG);
    if (fileRef.current) fileRef.current.value = "";
    toast.success("بنر به حالت پیش‌فرض بازگشت");
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("فقط فایل تصویری مجاز است (JPG یا PNG)");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error("حجم تصویر باید کمتر از ۶ مگابایت باشد");
      return;
    }
    try {
      const dataUrl = await fileToBanner(file);
      setBanner(CURRENT_SELLER_SLUG, dataUrl);
      toast.success("بنر سفارشی بارگذاری شد");
    } catch {
      toast.error("بارگذاری تصویر ناموفق بود");
    } finally {
      // allow re-selecting the same file
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="card-elevated p-6">
      {/* Heading */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
        <div className="flex items-center gap-2">
          <ImageIcon size={16} className="text-primary" />
          <div>
            <h2 className="text-sm font-700 text-foreground">بنر نمایشگاه</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              این بنر در کارت فروشنده و صفحه نمایشگاه شما نمایش داده می‌شود.
            </p>
          </div>
        </div>
        {value && (
          <button type="button" onClick={reset} className="btn-secondary text-xs shrink-0">
            <RotateCcw size={13} />
            پیش‌فرض
          </button>
        )}
      </div>

      {/* Live preview */}
      <div
        className="relative h-28 rounded-xl overflow-hidden mb-5"
        style={{ background: preview }}
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size-[14px_14px]" />
        <span className="absolute bottom-3 right-3 text-2xs font-700 text-white/90 bg-black/20 backdrop-blur-sm rounded-md px-2 py-1">
          {customActive ? "بنر سفارشی" : "پیش‌نمایش بنر"}
        </span>
      </div>

      {/* Upload custom */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onUpload}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={`flex items-center justify-center gap-2 w-full h-11 mb-5 rounded-xl border-2 border-dashed text-sm font-600 transition-colors duration-150 ${
          customActive
            ? "border-primary text-primary bg-primary/5"
            : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
        }`}
      >
        <Upload size={15} />
        {customActive ? "تغییر بنر سفارشی" : "بارگذاری بنر سفارشی"}
      </button>

      {/* Preset swatches */}
      <div className="text-2xs font-600 text-muted-foreground mb-2.5">
        یا یکی از طرح‌های آماده را انتخاب کنید
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {bannerPresets.map((preset) => {
          const active = value === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => choosePreset(preset.id)}
              aria-pressed={active}
              className={`group relative h-16 rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                active
                  ? "border-primary ring-2 ring-primary/25"
                  : "border-transparent hover:border-border"
              }`}
              style={{ background: preset.gradient }}
            >
              {active && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/90">
                    <Check size={14} className="text-primary" />
                  </span>
                </span>
              )}
              <span className="absolute bottom-1 right-1.5 text-2xs font-600 text-white/90 drop-shadow">
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
