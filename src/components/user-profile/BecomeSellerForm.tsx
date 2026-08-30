"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  businessTypeOptions,
  cityOptions,
  sellerBenefits,
} from "@/context/userProfile";
import { supabase } from "@/lib/supabase/client";
import { useUserInfo } from "@/context/UserInfoProvider";
import { optionalUrl, requiredText } from "@/lib/validation";
import type { SellerApplicationStatus } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Clock, Store } from "lucide-react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
  status: SellerApplicationStatus;
  onSubmitted?: () => void;
}

const sellerApplicationSchema = z.object({
  businessName: requiredText("نام کسب‌وکار الزامی است"),
  businessType: requiredText("نوع فعالیت را انتخاب کنید"),
  businessId: requiredText("شناسه ملی الزامی است"),
  phone: z.string().trim().optional(),
  city: z.string().trim().optional(),
  address: z.string().trim().optional(),
  website: optionalUrl,
  agreed: z.boolean().refine((value) => value, {
    message: "برای ادامه باید قوانین فروشندگان را بپذیرید",
  }),
});

type SellerApplicationValues = z.infer<typeof sellerApplicationSchema>;

export default function BecomeSellerForm({ status, onSubmitted }: Props) {
  const { user, refreshProfile } = useUserInfo();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SellerApplicationValues>({
    resolver: zodResolver(sellerApplicationSchema),
    defaultValues: {
      businessName: "",
      businessType: "",
      businessId: "",
      phone: "",
      city: "",
      address: "",
      website: "",
      agreed: false,
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
        seller_application_status: "PENDING",
        // Optionally store the submitted business info as well
        // business_name: data.businessName,
        // business_type: data.businessType,
        // phone: data.phone || null,
        // city: data.city || null,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("خطا در ثبت درخواست. لطفاً دوباره تلاش کنید.");
      return;
    }

    await refreshProfile();
    toast.success("درخواست تایید شدن شما ثبت شد و در حال بررسی است");
    onSubmitted?.();
  });

  // ---- Application already submitted -------------------------------------
  if (status === "PENDING") {
    return (
      <div className="card-elevated p-8 flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center">
          <Clock size={26} className="text-warning" />
        </div>
        <h2 className="text-lg font-800 text-foreground">
          درخواست شما در حال بررسی است
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          کارشناسان زیرومارکت اطلاعات کسب‌وکار شما را بررسی می‌کنند. نتیجه طی ۲۴
          تا ۴۸ ساعت آینده از طریق ایمیل به شما اطلاع داده می‌شود.
        </p>
      </div>
    );
  }

  if (status === "APPROVED") {
    return (
      <div className="card-elevated p-8 flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
          <CheckCircle2 size={26} className="text-success" />
        </div>
        <h2 className="text-lg font-800 text-foreground">
          حساب فروشندگی شما فعال شد
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          اکنون می‌توانید آگهی ثبت کنید و درخواست‌های خرید را مدیریت کنید.
        </p>
        <Link href="/dashboard/seller" className="btn-primary text-sm mt-1">
          <Store size={14} />
          ورود به داشبورد فروشنده
        </Link>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="card-elevated p-8 flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <Clock size={26} className="text-destructive" />
        </div>
        <h2 className="text-lg font-800 text-foreground">
          متاسفانه درخواست شما رد شد
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          اطلاعات کسب‌وکار شما مورد تایید کارشناسان زیرومارکت قرار نگرفت. لطفاً
          اطلاعات خود را بررسی و اصلاح کنید و دوباره درخواست دهید.
        </p>
      </div>
    );
  }

  // ---- Application form ----------------------------------------------------
  return (
    <div className="flex flex-col gap-6">
      {/* Benefits */}
      <div className="rounded-2xl bg-foreground p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Store size={18} className="text-accent" />
          <h2 className="text-base font-800">فروشنده زیرومارکت شوید</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sellerBenefits.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={17} className="text-accent" />
                </div>
                <div>
                  <div className="text-sm font-700">{b.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {b.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} noValidate className="card-elevated p-6">
        <div className="mb-5">
          <h3 className="text-sm font-700 text-foreground">اطلاعات کسب‌وکار</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            برای احراز هویت و فعال‌سازی حساب فروشندگی، اطلاعات زیر را تکمیل
            کنید.
          </p>
        </div>

        <FieldGroup>
          <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field data-invalid={!!errors.businessName}>
              <FieldLabel htmlFor="businessName">نام کسب‌وکار</FieldLabel>
              <Input
                id="businessName"
                placeholder="مثلاً نمایشگاه آریا موتورز"
                aria-invalid={!!errors.businessName}
                {...register("businessName")}
              />
              <FieldError>{errors.businessName?.message}</FieldError>
            </Field>
            <Field data-invalid={!!errors.businessType}>
              <FieldLabel htmlFor="businessType">نوع فعالیت</FieldLabel>
              <Controller
                control={control}
                name="businessType"
                render={({ field }) => (
                  <Select
                    dir="rtl"
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="businessType"
                      className="w-full vazir-matn"
                    >
                      <SelectValue placeholder="انتخاب نوع فعالیت" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypeOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.businessType?.message}</FieldError>
            </Field>
          </Field>

          <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field data-invalid={!!errors.businessId}>
              <FieldLabel htmlFor="businessId">
                شناسه ملی / کد اقتصادی
              </FieldLabel>
              <Input
                id="businessId"
                placeholder="۱۰ تا ۱۱ رقم"
                aria-invalid={!!errors.businessId}
                {...register("businessId")}
              />
              <FieldError>{errors.businessId?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="bizPhone">تلفن کسب‌وکار</FieldLabel>
              <Input
                id="bizPhone"
                placeholder="۰۲۱ ۰۰۰۰ ۰۰۰۰"
                {...register("phone")}
              />
            </Field>
          </Field>

          <Field>
            <FieldLabel htmlFor="bizCity">شهر فعالیت</FieldLabel>
            <Controller
              control={control}
              name="city"
              render={({ field }) => (
                <Select
                  dir="rtl"
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="bizCity" className="w-full vazir-matn">
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
          </Field>

          <Field>
            <FieldLabel htmlFor="address">نشانی محل فعالیت</FieldLabel>
            <textarea
              id="address"
              rows={2}
              placeholder="نشانی کامل نمایشگاه یا دفتر…"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              {...register("address")}
            />
          </Field>

          {/* <Field data-invalid={!!errors.website}>
            <FieldLabel htmlFor="website">
              وب‌سایت{" "}
              <span className="text-muted-foreground font-normal">(اختیاری)</span>
            </FieldLabel>
            <Input
              id="website"
              placeholder="https://"
              aria-invalid={!!errors.website}
              {...register("website")}
            />
            <FieldError>{errors.website?.message}</FieldError>
          </Field> */}

          <div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <Controller
                control={control}
                name="agreed"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(!!v)}
                    className="mt-0.5"
                    aria-label="پذیرش قوانین فروشندگان"
                  />
                )}
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-foreground font-600">
                  قوانین و مقررات فروشندگان
                </span>{" "}
                زیرومارکت را می‌پذیرم و صحت اطلاعات واردشده را تأیید می‌کنم.
              </span>
            </label>
            <FieldError>{errors.agreed?.message}</FieldError>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="text-sm">
              <Store size={14} />
              ارسال درخواست فروشندگی
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
