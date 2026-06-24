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
import { cityOptions, currentUser } from "@/context/userProfile";
import { emailField, requiredText } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Upload } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const personalInfoSchema = z.object({
  fullName: requiredText("نام کامل الزامی است"),
  email: emailField,
  phone: z.string().trim().optional(),
  city: requiredText("شهر را انتخاب کنید"),
  bio: z.string().trim().max(300, "حداکثر ۳۰۰ کاراکتر").optional(),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

export default function PersonalInfoForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: currentUser.fullName,
      email: currentUser.email,
      phone: currentUser.phone,
      city: currentUser.city,
      bio: currentUser.bio,
    },
  });

  const onSubmit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 400));
    toast.success("اطلاعات شخصی با موفقیت ذخیره شد");
  });

  return (
    <form onSubmit={onSubmit} noValidate className="card-elevated p-6">
      {/* Avatar row */}
      <div className="flex items-center gap-4 pb-6 mb-6 border-b border-border">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white font-800 text-xl flex-shrink-0">
          {currentUser.avatar}
        </div>
        <div>
          <h2 className="text-sm font-700 text-foreground">تصویر پروفایل</h2>
          <p className="text-xs text-muted-foreground mt-0.5 mb-2">
            فرمت‌های مجاز: JPG یا PNG، حداکثر ۲ مگابایت.
          </p>
          <button
            type="button"
            onClick={() => toast.info("بارگذاری تصویر در نسخه نمایشی غیرفعال است")}
            className="btn-secondary text-xs"
          >
            <Upload size={13} />
            تغییر تصویر
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
              {...register("fullName")}
            />
            <FieldError>{errors.fullName?.message}</FieldError>
          </Field>
          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone">شماره تماس</FieldLabel>
            <Input
              id="phone"
              placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰"
              aria-invalid={!!errors.phone}
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
                <Select dir="rtl" value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="city" className="w-full vazir-matn">
                    <SelectValue placeholder="انتخاب شهر" />
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
