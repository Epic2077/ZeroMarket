"use client";

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
import Avatar from "@/components/shared/Avatar";
import { cityOptions } from "@/context/userProfile";
import { supabase } from "@/lib/supabase/client";
import { emailField, requiredText } from "@/lib/validation";
import type { PlatformUser, ProfileInput } from "@/types/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUp, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
  user: PlatformUser;
  onSubmit: (input: ProfileInput) => void;
  onAvatarChange: (avatarPath: string | null) => void;
  onClose: () => void;
}

const profileSchema = z.object({
  name: requiredText("نام الزامی است"),
  email: emailField,
  phone: requiredText("شماره تماس الزامی است"),
  city: requiredText("شهر را انتخاب کنید"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const AVATAR_BUCKET = "avatar";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProfileFormModal({
  user,
  onSubmit,
  onAvatarChange,
  onClose,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewPath, setPreviewPath] = useState<string | null>(
    user.avatarPath,
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
    },
  });

  const submit = handleSubmit((values) => {
    onSubmit(values);
    onClose();
  });

  const uploadAvatar = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("فقط تصاویر JPEG، PNG یا WebP مجاز هستند");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("حجم تصویر نباید بیشتر از ۲ مگابایت باشد");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;

      // Delete old avatar from storage if exists
      if (previewPath) {
        const oldPath = previewPath
          .replace(
            /^https?:\/\/[^/]+\/storage\/v1\/object\/public\/avatar\//,
            "",
          )
          .replace(/^\/+/, "");
        await supabase.storage.from(AVATAR_BUCKET).remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Update profiles table
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_path: path }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      setPreviewPath(path);
      onAvatarChange(path);
      toast.success("تصویر پروفایل با موفقیت تغییر کرد");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در آپلود تصویر");
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    if (!previewPath) return;

    setUploading(true);
    try {
      const oldPath = previewPath
        .replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/avatar\//, "")
        .replace(/^\/+/, "");

      const { error: removeError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .remove([oldPath]);

      if (removeError) throw removeError;

      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_path: null }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      setPreviewPath(null);
      onAvatarChange(null);
      toast.success("تصویر پروفایل حذف شد");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در حذف تصویر");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 vazir-matn"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="ویرایش پروفایل"
    >
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <form
        onSubmit={submit}
        noValidate
        className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-800 text-foreground">ویرایش پروفایل</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors duration-150"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4">
          {/* Avatar section */}
          <div className="flex items-center gap-4 mb-5 pb-4 border-b border-border">
            <Avatar src={previewPath} name={user.name} size="w-16 h-16" />
            <div className="flex flex-col gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadAvatar(file);
                  // reset so re-selecting the same file triggers onChange
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-600 text-primary hover:text-primary/80 transition-colors duration-150 disabled:opacity-50"
              >
                <ImageUp size={14} />
                {uploading ? "در حال آپلود…" : "تغییر تصویر"}
              </button>
              {previewPath && (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={removeAvatar}
                  className="inline-flex items-center gap-1.5 text-xs font-600 text-danger hover:text-danger/80 transition-colors duration-150 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  حذف تصویر
                </button>
              )}
            </div>
          </div>

          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="profile-name">نام</FieldLabel>
              <Input
                id="profile-name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="profile-email">ایمیل</FieldLabel>
              <Input
                id="profile-email"
                type="email"
                dir="ltr"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError>{errors.email?.message}</FieldError>
            </Field>
            <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field data-invalid={!!errors.phone}>
                <FieldLabel htmlFor="profile-phone">شماره تماس</FieldLabel>
                <Input
                  id="profile-phone"
                  aria-invalid={!!errors.phone}
                  {...register("phone")}
                />
                <FieldError>{errors.phone?.message}</FieldError>
              </Field>
              <Field data-invalid={!!errors.city}>
                <FieldLabel htmlFor="profile-city">شهر</FieldLabel>
                <Controller
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <Select
                      dir="rtl"
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="profile-city"
                        className="w-full vazir-matn"
                      >
                        <SelectValue placeholder="انتخاب شهر" />
                      </SelectTrigger>
                      <SelectContent className="z-[61]">
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
          </FieldGroup>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
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
            ذخیره
          </button>
        </div>
      </form>
    </div>
  );
}
