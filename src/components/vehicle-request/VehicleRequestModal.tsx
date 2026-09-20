"use client";

import { X, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import { useForm, useWatch, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useUserInfo } from "@/context/UserInfoProvider";

import { VehicleRequestStepVehicle } from "./VehicleRequestStepVehicle";
import { VehicleRequestStepPurchaseMethod } from "./VehicleRequestStepPurchaseMethod";
import { VehicleRequestStepContact } from "./VehicleRequestStepContact";
import { VehicleRequestSuccess } from "./VehicleRequestSuccess";
import {
  vehicleRequestSchema,
  type VehicleRequestFormValues,
} from "@/lib/validation/vehicleRequest";

const STEPS = [
  { key: "vehicle", label: "خودرو" },
  { key: "purchaseMethod", label: "روش خرید" },
  { key: "contact", label: "تماس" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

interface VehicleRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBrand?: string;
  preselectedModel?: string;
  embedded?: boolean;
}

export function VehicleRequestModal({
  isOpen,
  onClose,
  preselectedBrand,
  preselectedModel,
  embedded = false,
}: VehicleRequestModalProps) {
  const { user } = useUserInfo();
  const [currentStep, setCurrentStep] = useState<StepKey>("vehicle");
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] =
    useState<VehicleRequestFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState<number | null>(
    null,
  );

  const form = useForm<VehicleRequestFormValues>({
    resolver: zodResolver(vehicleRequestSchema),
    defaultValues: {
      brand: preselectedBrand ?? "",
      model: preselectedModel ?? "",
      purchaseMethod: "",
      firstName: "",
      lastName: "",
      city: "",
      phone: "",
    },
    mode: "onChange",
  });

  const watchedBrand = useWatch({ control: form.control, name: "brand" });
  const watchedModel = useWatch({ control: form.control, name: "model" });
  const watchedPurchaseMethod = useWatch({
    control: form.control,
    name: "purchaseMethod",
  });
  const watchedFirstName = useWatch({
    control: form.control,
    name: "firstName",
  });
  const watchedLastName = useWatch({ control: form.control, name: "lastName" });
  const watchedCity = useWatch({ control: form.control, name: "city" });
  const watchedPhone = useWatch({ control: form.control, name: "phone" });

  useEffect(() => {
    if (isOpen) {
      setCurrentStep("vehicle");
      setShowSuccess(false);
      setSubmittedData(null);
      setSubmitError(null);
      setLimitReached(false);
      if (preselectedBrand) {
        form.setValue("brand", preselectedBrand, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      if (preselectedModel) {
        form.setValue("model", preselectedModel, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  }, [form, isOpen, preselectedBrand, preselectedModel]);

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case "vehicle":
        return !!watchedBrand && !!watchedModel;
      case "purchaseMethod":
        return !!watchedPurchaseMethod;
      case "contact":
        return (
          !!watchedFirstName &&
          !!watchedLastName &&
          !!watchedCity &&
          !!watchedPhone
        );
      default:
        return false;
    }
  }, [
    currentStep,
    watchedBrand,
    watchedModel,
    watchedPurchaseMethod,
    watchedFirstName,
    watchedLastName,
    watchedCity,
    watchedPhone,
  ]);

  const handleNext = async () => {
    if (currentStepIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentStepIndex + 1].key;
      let shouldProceed = false;

      switch (currentStep) {
        case "vehicle":
          shouldProceed = !!watchedBrand && !!watchedModel;
          break;
        case "purchaseMethod":
          shouldProceed = await form.trigger("purchaseMethod");
          break;
        case "contact":
          shouldProceed = await form.trigger([
            "firstName",
            "lastName",
            "city",
            "phone",
          ]);
          break;
      }

      if (shouldProceed) {
        setCurrentStep(nextStep);
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].key);
    }
  };

  const handleSubmitForm = form.handleSubmit(async (values) => {
    if (!user) {
      toast.error("برای ثبت درخواست باید وارد حساب کاربری شوید");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/vehicle-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.limitReached) {
          setLimitReached(true);
          setRemainingRequests(data.remaining ?? 0);
          return;
        }
        throw new Error(data.error ?? "خطا در ثبت درخواست");
      }

      setSubmittedData(values);
      setShowSuccess(true);
      toast.success("درخواست خرید شما با موفقیت ثبت شد");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "خطای ناشناخته");
      toast.error(err instanceof Error ? err.message : "خطا در ثبت درخواست");
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleNewRequest = () => {
    setShowSuccess(false);
    setCurrentStep("vehicle");
    form.reset({
      brand: "",
      model: "",
      purchaseMethod: "",
      firstName: "",
      lastName: "",
      city: "",
      phone: "",
    });
  };

  const handleClose = () => {
    onClose();
    setShowSuccess(false);
    setCurrentStep("vehicle");
    setSubmittedData(null);
    setSubmitError(null);
    setLimitReached(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${embedded ? "min-h-[calc(100vh-5rem)] bg-muted/30 py-8" : "fixed inset-0 z-50 flex items-center justify-center p-4"} vazir-matn`}
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="درخواست خرید خودرو"
    >
      {!embedded && (
        <div
          className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`${embedded ? "min-h-[calc(100vh-9rem)]" : "min-h-[50vh] max-h-[75vh] mt-10"} relative bg-card rounded-2xl shadow-2xl w-full max-w-4xl mx-auto flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          {!showSuccess && !limitReached && (
            <div className="flex items-center gap-2 text-xs font-600 text-muted-foreground">
              {STEPS.map((step, index) => (
                <span
                  key={step.key}
                  className={`flex items-center gap-1.5 ${
                    index <= currentStepIndex
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      index < currentStepIndex
                        ? "bg-primary text-primary-foreground"
                        : index === currentStepIndex
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <circle cx="5" cy="5" r="5" fill="currentColor" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </span>
                  {index < STEPS.length - 1 && (
                    <span className="hidden sm:inline-block w-8 h-0.5 bg-border" />
                  )}
                </span>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors duration-150"
            aria-label="بستن"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto flex-1">
          {limitReached ? (
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                <AlertCircle size={32} className="text-warning" />
              </div>
              <h2 className="text-xl font-800 text-foreground mb-2">
                به محدودیت درخواست رسیده‌اید
              </h2>
              <p className="text-muted-foreground mb-4 max-w-sm">
                شما حداکثر تعداد درخواست‌های رایگان را در این ماه استفاده
                کرده‌اید.
                {remainingRequests !== null && remainingRequests === 0 && (
                  <span className="block mt-1">
                    شما درخواست رایگان باقی‌مانده‌ای ندارید.
                  </span>
                )}
              </p>
              <p className="text-sm text-primary font-600 mb-4">
                با ارتقاء به اشتراک پرمیوم، تعداد درخواست‌های نامحدود داشته
                باشید.
              </p>
              <Button variant="secondary" onClick={handleClose}>
                بستن
              </Button>
            </div>
          ) : showSuccess && submittedData ? (
            <VehicleRequestSuccess
              data={submittedData}
              onClose={handleClose}
              onNewRequest={handleNewRequest}
            />
          ) : (
            <>
              {/* Step Content */}
              <FormProvider {...form}>
                {currentStep === "vehicle" && (
                  <VehicleRequestStepVehicle
                    control={form.control}
                    errors={form.formState.errors}
                    preselectedBrand={preselectedBrand}
                    preselectedModel={preselectedModel}
                  />
                )}
                {currentStep === "purchaseMethod" && (
                  <VehicleRequestStepPurchaseMethod
                    control={form.control}
                    errors={form.formState.errors}
                  />
                )}
                {currentStep === "contact" && (
                  <VehicleRequestStepContact
                    control={form.control}
                    errors={form.formState.errors}
                  />
                )}
              </FormProvider>
            </>
          )}
        </div>

        {/* Footer */}
        {!showSuccess && !limitReached && (
          <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-border shrink-0">
            {currentStepIndex > 0 && (
              <Button type="button" variant="secondary" onClick={handleBack}>
                <ChevronRight size={14} />
                بازگشت
              </Button>
            )}
            {currentStepIndex < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                ادامه
                <ChevronRight size={14} className="rotate-180" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmitForm}
                disabled={isSubmitting || !canProceed()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    ثبت درخواست...
                  </>
                ) : (
                  "ثبت درخواست"
                )}
              </Button>
            )}
          </div>
        )}

        {submitError && !showSuccess && !limitReached && (
          <div className="px-5 pb-4 text-center">
            <p className="text-sm text-danger flex items-center justify-center gap-1.5">
              <AlertCircle size={14} />
              {submitError}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
