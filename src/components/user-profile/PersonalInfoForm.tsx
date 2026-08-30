"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { useUserInfo } from "@/context/UserInfoProvider";
import { cityOptions } from "@/context/userProfile";
import { emailField, requiredText } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Trash2, Upload } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Avatar from "../shared/Avatar";

const personalInfoSchema = z.object({
  fullName: requiredText("نام کامل الزامی است"),
  email: emailField,
  phone: z.string().trim().optional(),
  city: requiredText("شهر را انتخاب کنید"),
  bio: z.string().trim().max(300, "حداکثر ۳۰۰ کاراکتر").optional(),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const AVATAR_SIZE = 256; // compress to 256×256

/** Compress an image file to a JPEG blob at the target size. */
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement("canvas");
      canvas.width = AVATAR_SIZE;
      canvas.height = AVATAR_SIZE;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Cover-crop: scale to fill the square, centered
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas toBlob returned null"));
          }
        },
        "image/jpeg",
        0.8,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

export default function PersonalInfoForm() {
  const { user, profile, refreshProfile } = useUserInfo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: profile?.full_name,
      email: profile?.email,
      phone: profile?.phone || "",
      city: profile?.city || "",
      bio: profile?.bio || "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!user) {
      toast.error("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.fullName,
        phone: data.phone || null,
        city: data.city || null,
        bio: data.bio || null,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("خطا در ذخیره اطلاعات");
      return;
    }

    await refreshProfile();
    toast.success("اطلاعات شخصی با موفقیت ذخیره شد");
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) {
      return;
    }

    // Reset so the same file can be re-selected
    e.target.value = "";

    if (file.size > MAX_SIZE) {
      toast.error("حجم فایل نباید بیشتر از ۲ مگابایت باشد");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("فقط فایل‌های تصویری مجاز هستند");
      return;
    }

    setUploading(true);

    try {
      // 1. Compress
      const compressed = await compressImage(file);

      // 2. Upload to Storage
      const filePath = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("avatar")
        .upload(filePath, compressed, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // 4. Save path to profiles
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_path: filePath })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      // 5. Refresh profile context so the UI updates immediately
      await refreshProfile();
      toast.success("تصویر پروفایل با موفقیت به‌روز شد");
    } catch {
      toast.error("خطا در بارگذاری تصویر. لطفاً دوباره تلاش کنید.");
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!user || !profile?.avatar_path) {
      return;
    }

    setRemoving(true);

    try {
      // 1. Remove from Storage
      const { error: removeError } = await supabase.storage
        .from("avatar")
        .remove([profile.avatar_path]);

      if (removeError) {
        throw removeError;
      }

      // 2. Remove path from profiles
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_path: null })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      // 3. Refresh profile context so the UI updates immediately
      await refreshProfile();
      toast.success("تصویر پروفایل با موفقیت حذف شد");
    } catch {
      toast.error("خطا در حذف تصویر. لطفاً دوباره تلاش کنید.");
    } finally {
      setRemoving(false);
    }
  };

  // Sync profile data into the form whenever profile loads/changes
  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.full_name ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        city: profile.city ?? "",
        bio: profile.bio ?? "",
      });
    }
  }, [profile, reset]);

  return (
    <form onSubmit={onSubmit} noValidate className="card-elevated p-6">
      {/* Avatar row */}
      <div className="flex items-center gap-4 pb-6 mb-6 border-b border-border">
        <Avatar
          src={profile?.avatar_path}
          name={profile?.full_name}
          size="w-16 h-16"
          className="text-lg"
        />
        <div>
          <h2 className="text-sm font-700 text-foreground">تصویر پروفایل</h2>
          <p className="text-xs text-muted-foreground mt-0.5 mb-2">
            فرمت‌های مجاز: JPG یا PNG، حداکثر ۲ مگابایت.
          </p>
          {/* <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary text-xs"
          >
            <Upload size={13} />
            {uploading ? "در حال بارگذاری…" : "تغییر تصویر"}
          </button> */}
          <button
            type="button"
            disabled={removing}
            onClick={handleAvatarRemove}
            className="btn-secondary mr-2 text-danger! border-danger! text-xs"
          >
            <Trash2 size={13} />
            {removing ? "در حال حذف تصویر..." : "حذف تصویر"}
          </button>
        </div>
      </div>

      <FieldGroup>
        <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field data-invalid={!!errors.fullName}>
            <FieldLabel htmlFor="fullName">نام کامل</FieldLabel>
            <Input
              id="fullName"
              placeholder="نام و نام خانوادگی"
              aria-invalid={!!errors.fullName}
              defaultValue={profile?.full_name ?? ""}
              {...register("fullName")}
            />
            <FieldError>{errors.fullName?.message}</FieldError>
          </Field>
          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone">شماره تماس</FieldLabel>
            <Input
              id="phone"
              placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰"
              dir="ltr"
              aria-invalid={!!errors.phone}
              defaultValue={profile?.phone ?? ""}
              {...register("phone")}
            />
            <FieldError>{errors.phone?.message}</FieldError>
          </Field>
        </Field>

        <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">ایمیل</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              aria-invalid={!!errors.email}
              defaultValue={profile?.email ?? ""}
              {...register("email")}
            />
            <FieldError>{errors.email?.message}</FieldError>
          </Field>
          <Field data-invalid={!!errors.city}>
            <FieldLabel htmlFor="city">شهر</FieldLabel>
            <Controller
              control={control}
              name="city"
              render={({ field }) => (
                <Select
                  dir="rtl"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="city" className="w-full vazir-matn">
                    <SelectValue
                      placeholder="انتخاب شهر"
                      defaultValue={profile?.city ?? ""}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.city?.message}</FieldError>
          </Field>
        </Field>

        <Field data-invalid={!!errors.bio}>
          <FieldLabel htmlFor="bio">درباره من</FieldLabel>
          <textarea
            id="bio"
            rows={3}
            placeholder="توضیح کوتاهی درباره خودتان بنویسید…"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            defaultValue={profile?.bio ?? ""}
            {...register("bio")}
          />
          <FieldError>{errors.bio?.message}</FieldError>
        </Field>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="text-sm">
            <Save size={14} />
            ذخیره تغییرات
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
