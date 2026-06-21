"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
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
import type { SellerApplicationStatus } from "@/types/user";
import { CheckCircle2, Clock, Store } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  status: SellerApplicationStatus;
  onSubmitted: () => void;
}

const emptyForm = {
  businessName: "",
  businessType: "",
  businessId: "",
  phone: "",
  city: "",
  address: "",
  website: "",
};

export default function BecomeSellerForm({ status, onSubmitted }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [agreed, setAgreed] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ---- Application already submitted -------------------------------------
  if (status === "pending") {
    return (
      <div className="card-elevated p-8 flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center">
          <Clock size={26} className="text-warning" />
        </div>
        <h2 className="text-lg font-800 text-foreground">
          درخواست شما در حال بررسی است
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          کارشناسان زیرومارکت اطلاعات کسب‌وکار شما را بررسی می‌کنند. نتیجه طی
          ۲۴ تا ۴۸ ساعت آینده از طریق ایمیل به شما اطلاع داده می‌شود.
        </p>
      </div>
    );
  }

  if (status === "approved") {
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

  // ---- Application form ----------------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim() || !form.businessType || !form.businessId.trim()) {
      toast.error("نام کسب‌وکار، نوع فعالیت و شناسه ملی الزامی است");
      return;
    }
    if (!agreed) {
      toast.error("برای ادامه باید قوانین فروشندگان را بپذیرید");
      return;
    }
    toast.success("درخواست فروشندگی شما ثبت شد و در حال بررسی است");
    onSubmitted();
  };

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
      <form onSubmit={handleSubmit} className="card-elevated p-6">
        <div className="mb-5">
          <h3 className="text-sm font-700 text-foreground">اطلاعات کسب‌وکار</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            برای احراز هویت و فعال‌سازی حساب فروشندگی، اطلاعات زیر را تکمیل کنید.
          </p>
        </div>

        <FieldGroup>
          <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="businessName">نام کسب‌وکار</FieldLabel>
              <Input
                id="businessName"
                value={form.businessName}
                onChange={(e) => set("businessName", e.target.value)}
                placeholder="مثلاً نمایشگاه آریا موتورز"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="businessType">نوع فعالیت</FieldLabel>
              <Select
                dir="rtl"
                value={form.businessType || undefined}
                onValueChange={(v) => set("businessType", v)}
              >
                <SelectTrigger id="businessType" className="w-full vazir-matn">
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
            </Field>
          </Field>

          <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="businessId">
                شناسه ملی / کد اقتصادی
              </FieldLabel>
              <Input
                id="businessId"
                value={form.businessId}
                onChange={(e) => set("businessId", e.target.value)}
                placeholder="۱۰ تا ۱۱ رقم"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="bizPhone">تلفن کسب‌وکار</FieldLabel>
              <Input
                id="bizPhone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="۰۲۱ ۰۰۰۰ ۰۰۰۰"
              />
            </Field>
          </Field>

          <Field>
            <FieldLabel htmlFor="bizCity">شهر فعالیت</FieldLabel>
            <Select
              dir="rtl"
              value={form.city || undefined}
              onValueChange={(v) => set("city", v)}
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
          </Field>

          <Field>
            <FieldLabel htmlFor="address">نشانی محل فعالیت</FieldLabel>
            <textarea
              id="address"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              rows={2}
              placeholder="نشانی کامل نمایشگاه یا دفتر…"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="website">
              وب‌سایت{" "}
              <span className="text-muted-foreground font-normal">(اختیاری)</span>
            </FieldLabel>
            <Input
              id="website"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://"
            />
          </Field>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox
              checked={agreed}
              onCheckedChange={(v) => setAgreed(!!v)}
              className="mt-0.5"
              aria-label="پذیرش قوانین فروشندگان"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-foreground font-600">
                قوانین و مقررات فروشندگان
              </span>{" "}
              زیرومارکت را می‌پذیرم و صحت اطلاعات واردشده را تأیید می‌کنم.
            </span>
          </label>

          <div className="flex justify-end">
            <Button type="submit" className="text-sm">
              <Store size={14} />
              ارسال درخواست فروشندگی
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
