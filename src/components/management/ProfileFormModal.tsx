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
import { cityOptions } from "@/context/userProfile";
import { emailField, requiredText } from "@/lib/validation";
import type { PlatformUser, ProfileInput } from "@/types/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

interface Props {
  user: PlatformUser;
  onSubmit: (input: ProfileInput) => void;
  onClose: () => void;
}

const profileSchema = z.object({
  name: requiredText("نام الزامی است"),
  email: emailField,
  phone: requiredText("شماره تماس الزامی است"),
  city: requiredText("شهر را انتخاب کنید"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileFormModal({ user, onSubmit, onClose }: Props) {
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

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 vazir-matn "
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
                      <SelectContent>
                        {cityOptions.map((o) => (
                          <SelectItem key={o.value} value={o.label}>
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
