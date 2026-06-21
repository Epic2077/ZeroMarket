"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cityOptions, currentUser } from "@/context/userProfile";
import { Save, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PersonalInfoForm() {
  const [form, setForm] = useState({
    fullName: currentUser.fullName,
    email: currentUser.email,
    phone: currentUser.phone,
    city: currentUser.city,
    bio: currentUser.bio,
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error("نام و ایمیل نمی‌توانند خالی باشند");
      return;
    }
    toast.success("اطلاعات شخصی با موفقیت ذخیره شد");
  };

  return (
    <form onSubmit={handleSubmit} className="card-elevated p-6">
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
          <Field>
            <FieldLabel htmlFor="fullName">نام کامل</FieldLabel>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="نام و نام خانوادگی"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">شماره تماس</FieldLabel>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰"
            />
          </Field>
        </Field>

        <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="email">ایمیل</FieldLabel>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="m@example.com"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="city">شهر</FieldLabel>
            <Select
              dir="rtl"
              value={form.city}
              onValueChange={(v) => set("city", v)}
            >
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
          </Field>
        </Field>

        <Field>
          <FieldLabel htmlFor="bio">درباره من</FieldLabel>
          <textarea
            id="bio"
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={3}
            placeholder="توضیح کوتاهی درباره خودتان بنویسید…"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </Field>

        <div className="flex justify-end">
          <Button type="submit" className="text-sm">
            <Save size={14} />
            ذخیره تغییرات
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
