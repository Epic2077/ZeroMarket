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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const securitySchema = z
  .object({
    newPassword: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیستند",
    path: ["confirmPassword"],
  });

type SecurityValues = z.infer<typeof securitySchema>;

export function SecurityForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SecurityValues>({
    resolver: zodResolver(securitySchema),
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
  });

  return (
    <div
      className={cn("flex flex-col gap-6 w-full max-w-md", className)}
      {...props}
      dir="rtl"
    >
      <Card className="shadow-xl shadow-primary/5 ring-1 ring-border/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-800">تغییر رمز عبور</CardTitle>
          <CardDescription>
            برای امنیت حساب کاربری، رمز عبور جدید خود را وارد کنید
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
                  {isSubmitting ? "در حال تغییر..." : "ذخیره تغییرات"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}