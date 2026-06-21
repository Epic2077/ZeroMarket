"use client";

import ToggleSwitch from "@/components/shared/ToggleSwitch";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const empty = { current: "", next: "", confirm: "" };

export default function SecurityForm() {
  const [form, setForm] = useState(empty);
  const [twoFactor, setTwoFactor] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.current || !form.next || !form.confirm) {
      toast.error("لطفاً همه فیلدها را تکمیل کنید");
      return;
    }
    if (form.next.length < 8) {
      toast.error("رمز عبور جدید باید حداقل ۸ کاراکتر باشد");
      return;
    }
    if (form.next !== form.confirm) {
      toast.error("رمز عبور جدید و تکرار آن یکسان نیستند");
      return;
    }
    toast.success("رمز عبور با موفقیت تغییر کرد");
    setForm(empty);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Change password */}
      <form onSubmit={handleSubmit} className="card-elevated p-6">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound size={18} className="text-primary" />
          <h2 className="text-sm font-700 text-foreground">تغییر رمز عبور</h2>
        </div>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="current">رمز عبور فعلی</FieldLabel>
            <Input
              id="current"
              type="password"
              value={form.current}
              onChange={(e) => set("current", e.target.value)}
            />
          </Field>
          <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="next">رمز عبور جدید</FieldLabel>
              <Input
                id="next"
                type="password"
                value={form.next}
                onChange={(e) => set("next", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm">تکرار رمز عبور جدید</FieldLabel>
              <Input
                id="confirm"
                type="password"
                value={form.confirm}
                onChange={(e) => set("confirm", e.target.value)}
              />
            </Field>
          </Field>
          <p className="text-xs text-muted-foreground">
            رمز عبور باید حداقل ۸ کاراکتر باشد.
          </p>
          <div className="flex justify-end">
            <Button type="submit" className="text-sm">
              به‌روزرسانی رمز عبور
            </Button>
          </div>
        </FieldGroup>
      </form>

      {/* Two-factor authentication */}
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={18} className="text-success" />
            </div>
            <div>
              <h2 className="text-sm font-700 text-foreground">
                ورود دو مرحله‌ای
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                با فعال‌سازی، هنگام ورود یک کد تأیید به تلفن شما ارسال می‌شود.
              </p>
            </div>
          </div>
          <ToggleSwitch
            checked={twoFactor}
            onChange={(next) => {
              setTwoFactor(next);
              toast.success(
                next ? "ورود دو مرحله‌ای فعال شد" : "ورود دو مرحله‌ای غیرفعال شد",
              );
            }}
            label="ورود دو مرحله‌ای"
          />
        </div>
      </div>
    </div>
  );
}
