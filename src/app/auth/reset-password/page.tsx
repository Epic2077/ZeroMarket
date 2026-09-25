"use client";

import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیستند",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("رمز عبور با موفقیت تغییر یافت");
    reset();
    router.push("/profile");
    router.refresh();
  });

  return (
    <div
      className={cn("flex flex-col gap-6 reveal-in w-full max-w-sm", className)}
      {...props}
      dir="rtl"
    >
      <Card className="shadow-xl shadow-primary/5 ring-1 ring-border/80">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-800">تنظیم رمز عبور جدید</CardTitle>
          <CardDescription>
            رمز عبور جدید خود را وارد کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.newPassword}>
                <FieldLabel htmlFor="new-password">رمز عبور جدید</FieldLabel>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.newPassword}
                  {...register("newPassword")}
                />
                <FieldError>{errors.newPassword?.message}</FieldError>
              </Field>
              <Field data-invalid={!!errors.confirmPassword}>
                <FieldLabel htmlFor="confirm-password">تکرار رمز عبور جدید</FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                <FieldError>{errors.confirmPassword?.message}</FieldError>
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 font-700"
                >
                  {isSubmitting ? "در حال تغییر..." : "تغییر رمز عبور"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <p className="px-4 text-center text-2xs text-muted-foreground leading-relaxed">
        با ادامه،{" "}
        <a
          href="#"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          شرایط استفاده
        </a>{" "}
        و{" "}
        <a
          href="#"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          حریم خصوصی
        </a>{" "}
        را می‌پذیرید.
      </p>
    </div>
  );
}

import Logo from "@/components/shared/Logo";
import { Car } from "lucide-react";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 vazir-matn" dir="rtl">
      <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden hero-gradient p-10">
        <div className="absolute top-[-20%] right-[-15%] size-[500px] rounded-full bg-white/[0.06]" />
        <div className="absolute bottom-[-10%] left-[-10%] size-[350px] rounded-full bg-white/[0.08]" />
        <div className="absolute top-[40%] left-[20%] size-[200px] rounded-full bg-accent/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center gap-6 text-center reveal-in">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <Logo size="large" />
          </div>

          <div>
            <h2 className="font-dyna text-3xl text-white font-700 tracking-tight">
              KhodroJu
            </h2>
            <p className="mt-2 text-sm text-white/70 leading-relaxed max-w-xs">
              بازار خودروهای صفرکیلومتر — شفاف، سریع و مطمئن.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: "🏷️", label: "قیمت شفاف" },
              { icon: "✅", label: "فروشندگان تأییدشده" },
              { icon: "📊", label: "تحلیل بازار" },
            ].map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm"
              >
                <span>{f.icon}</span>
                {f.label}
              </span>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-2 text-2xs text-white/50">
            <Car size={12} />
            <span>صفرکیلومتر، بدون واسطه</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 bg-background p-6 md:p-10 mt-10">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium lg:hidden"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Logo size="small" />
          </div>
          <span className="font-dyna text-lg text-foreground font-700">
            KhodroJu
          </span>
        </Link>

        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}