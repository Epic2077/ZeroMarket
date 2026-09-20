"use client";

import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { Banknote, CreditCard, Clock, Coins } from "lucide-react";
import { Section } from "@/components/shared/Section";
import type { VehicleRequestFormValues } from "@/lib/validation/vehicleRequest";

const PURCHASE_METHODS = [
  {
    value: "CASH",
    label: "نقدی",
    description: "پرداخت کامل و تحویل فوری",
    icon: Banknote,
  },
  {
    value: "INSTALLMENT",
    label: "اقساطی",
    description: "پرداخت به صورت اقساط ماهانه",
    icon: CreditCard,
  },
  {
    value: "PRE_SALE",
    label: "پیش‌فروش علی الحساب",
    description: "رزرو با پیش‌پرداخت و تحویل در آینده",
    icon: Clock,
  },
  {
    value: "MULTI_STAGE",
    label: "چند مرحله ای قیمت قطعی",
    description: "پرداخت در چند مرحله با قیمت نهایی ثابت",
    icon: Coins,
  },
] as const;

type PurchaseMethodValue = (typeof PURCHASE_METHODS)[number]["value"];

interface VehicleRequestStepPurchaseMethodProps {
  control: Control<VehicleRequestFormValues>;
  errors: FieldErrors<VehicleRequestFormValues>;
}

export function VehicleRequestStepPurchaseMethod({
  control,
  errors,
}: VehicleRequestStepPurchaseMethodProps) {
  return (
    <Section
      icon={<Coins size={16} className="text-primary" />}
      title="روش خرید"
    >
      <p className="text-sm text-muted-foreground mb-4">
        روش خرید مورد نظر خود را انتخاب کنید
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PURCHASE_METHODS.map((method) => {
          const Icon = method.icon;
          return (
            <Controller
              key={method.value}
              control={control}
              name="purchaseMethod"
              render={({ field }) => {
                const isSelected = field.value === method.value;
                return (
                  <button
                    type="button"
                    onClick={() => field.onChange(method.value)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-right hover:border-primary/50 ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:bg-muted/30"
                    }`}
                    role="radio"
                    aria-checked={isSelected}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-700 text-sm ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {method.label}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {method.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 left-2 w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center bg-primary">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                          >
                            <circle cx="5" cy="5" r="5" fill="white" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              }}
            />
          );
        })}
      </div>
      {errors.purchaseMethod && (
        <p className="text-sm text-danger mt-3">
          {errors.purchaseMethod.message}
        </p>
      )}
    </Section>
  );
}
