"use client";

import { User, MapPin, Phone } from "lucide-react";
import { Controller, type Control, type FieldErrors, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { SearchSelect } from "@/components/shared/SearchSelect";
import { Section } from "@/components/shared/Section";
import { useUserInfo } from "@/context/UserInfoProvider";
import { useEffect } from "react";
import { useTaxonomyOptions } from "@/hooks/useTaxonomyOptions";
import type { VehicleRequestFormValues } from "@/lib/validation/vehicleRequest";

interface VehicleRequestStepContactProps {
  control: Control<VehicleRequestFormValues>;
  errors: FieldErrors<VehicleRequestFormValues>;
}

export function VehicleRequestStepContact({
  control,
  errors,
}: VehicleRequestStepContactProps) {
  const { profile } = useUserInfo();
  const { values: taxonomyValues } = useTaxonomyOptions();
  const cityOptions = taxonomyValues("CITY");

  const { setValue } = useFormContext<VehicleRequestFormValues>();

  useEffect(() => {
    if (profile) {
      const firstName = profile.full_name?.split(" ")[0] ?? "";
      const lastName = profile.full_name?.split(" ").slice(1).join(" ") ?? "";

      setValue("firstName", firstName, { shouldValidate: true, shouldDirty: true });
      setValue("lastName", lastName, { shouldValidate: true, shouldDirty: true });
      if (profile.city) {
        setValue("city", profile.city, { shouldValidate: true, shouldDirty: true });
      }
      if (profile.phone) {
        setValue("phone", profile.phone, { shouldValidate: true, shouldDirty: true });
      }
    }
  }, [profile, setValue]);

  return (
    <Section
      icon={<User size={16} className="text-primary" />}
      title="اطلاعات تماس"
    >
      <p className="text-sm text-muted-foreground mb-4">
        اطلاعات زیر از پروفایل شما پر شده است. در صورت نیاز می‌توانید آن‌ها را ویرایش کنید.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          control={control}
          name="firstName"
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="vr-firstName"
                className="text-xs font-600 text-muted-foreground flex items-center gap-1.5"
              >
                <User size={13} className="text-muted-foreground" />
                نام
              </label>
              <Input
                id="vr-firstName"
                placeholder="نام"
                aria-invalid={!!errors.firstName}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
            </div>
          )}
        />
        {errors.firstName && (
          <p className="text-sm text-danger col-span-2">{errors.firstName.message}</p>
        )}

        <Controller
          control={control}
          name="lastName"
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="vr-lastName"
                className="text-xs font-600 text-muted-foreground flex items-center gap-1.5"
              >
                <User size={13} className="text-muted-foreground" />
                نام خانوادگی
              </label>
              <Input
                id="vr-lastName"
                placeholder="نام خانوادگی"
                aria-invalid={!!errors.lastName}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
            </div>
          )}
        />
        {errors.lastName && (
          <p className="text-sm text-danger col-span-2">{errors.lastName.message}</p>
        )}

        <Controller
          control={control}
          name="city"
          render={({ field }) => (
            <SearchSelect
              id="vr-city"
              label="شهر"
              value={field.value ?? ""}
              options={cityOptions}
              placeholder="انتخاب شهر"
              onChange={field.onChange}
              emptyText="شهری یافت نشد"
            />
          )}
        />
        {errors.city && (
          <p className="text-sm text-danger col-span-2">{errors.city.message}</p>
        )}

        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label
                htmlFor="vr-phone"
                className="text-xs font-600 text-muted-foreground flex items-center gap-1.5"
              >
                <Phone size={13} className="text-muted-foreground" />
                شماره تماس
              </label>
              <Input
                id="vr-phone"
                type="tel"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                aria-invalid={!!errors.phone}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                dir="ltr"
              />
            </div>
          )}
        />
        {errors.phone && (
          <p className="text-sm text-danger col-span-2">{errors.phone.message}</p>
        )}
      </div>
    </Section>
  );
}