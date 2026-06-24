"use client";

import ToggleSwitch from "@/components/shared/ToggleSwitch";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { passwordField, requiredText } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const passwordSchema = z
  .object({
    current: requiredText("رمز عبور فعلی الزامی است"),
    next: passwordField,
    confirm: z.string(),
  })
  .refine((data) => data.next === data.confirm, {
    message: "رمز عبور جدید و تکرار آن یکسان نیستند",
    path: ["confirm"],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

const emptyValues: PasswordValues = { current: "", next: "", confirm: "" };

export default function SecurityForm() {
  const [twoFactor, setTwoFactor] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: emptyValues,
  });

  const onSubmit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 400));
    toast.success("رمز عبور با موفقیت تغییر کرد");
    reset(emptyValues);
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Change password */}
      <form onSubmit={onSubmit} noValidate className="card-elevated p-6">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound size={18} className="text-primary" />
          <h2 className="text-sm font-700 text-foreground">تغییر رمز عبور</h2>
        </div>

        <FieldGroup>
          <Field data-invalid={!!errors.current}>
            <FieldLabel htmlFor="current">رمز عبور فعلی</FieldLabel>
            <Input
              id="current"
              type="password"
              aria-invalid={!!errors.current}
              {...register("current")}
            />
            <FieldError>{errors.current?.message}</FieldError>
          </Field>
          <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field data-invalid={!!errors.next}>
              <FieldLabel htmlFor="next">رمز عبور جدید</FieldLabel>
              <Input
                id="next"
                type="password"
                aria-invalid={!!errors.next}
                {...register("next")}
              />
              <FieldError>{errors.next?.message}</FieldError>
            </Field>
            <Field data-invalid={!!errors.confirm}>
              <FieldLabel htmlFor="confirm">تکرار رمز عبور جدید</FieldLabel>
              <Input
                id="confirm"
                type="password"
                aria-invalid={!!errors.confirm}
                {...register("confirm")}
              />
              <FieldError>{errors.confirm?.message}</FieldError>
            </Field>
          </Field>
          <p className="text-xs text-muted-foreground">
            رمز عبور باید حداقل ۸ کاراکتر باشد.
          </p>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="text-sm">
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
