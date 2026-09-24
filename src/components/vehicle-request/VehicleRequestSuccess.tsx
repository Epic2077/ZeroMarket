"use client";

import { CheckCircle2, Car, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { VehicleRequestFormValues } from "@/lib/validation/vehicleRequest";

interface VehicleRequestSuccessProps {
  data: VehicleRequestFormValues;
  onClose: () => void;
  onNewRequest: () => void;
}

export function VehicleRequestSuccess({
  data,
  onClose,
  onNewRequest,
}: VehicleRequestSuccessProps) {
  const getPurchaseMethodLabel = (value: string) => {
    const methods: Record<string, string> = {
      CASH: "نقدی",
      INSTALLMENT: "اقساطی",
      PRE_SALE: "پیش‌فروش / پیش‌پرداخت",
      MULTI_STAGE: "پرداخت چندمرحله‌ای قیمت ثابت",
    };
    return methods[value] ?? value;
  };

  return (
    <div className="flex flex-col items-center text-center py-8 px-4">
      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
        <CheckCircle2 size={32} className="text-success" />
      </div>
      <h2 className="text-xl font-800 text-foreground mb-2">درخواست شما ثبت شد</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        تیم ما به زودی با شما تماس گرفته تا جزئیات را نهایی و فرآیند خرید را آغاز کند.
      </p>

      <div className="w-full max-w-sm bg-muted/30 rounded-xl p-4 text-right mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Car size={16} className="text-primary" />
          <span className="font-700 text-foreground">
            {data.brand} {data.model}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2 text-sm">
          <span className="text-muted-foreground">روش خرید:</span>
          <span className="font-600 text-foreground">
            {getPurchaseMethodLabel(data.purchaseMethod)}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2 text-sm">
          <span className="text-muted-foreground">نام:</span>
          <span className="font-600 text-foreground">
            {data.firstName} {data.lastName}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2 text-sm">
          <span className="text-muted-foreground">شهر:</span>
          <span className="font-600 text-foreground">{data.city}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">تلفن:</span>
          <span className="font-600 text-foreground font-mono">{data.phone}</span>
        </div>
      </div>

      <div className="w-full max-w-sm flex flex-col sm:flex-row gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onNewRequest}
        >
          <ArrowRight size={14} className="rotate-180" />
          درخواست جدید
        </Button>
        <Button
          asChild
          variant="default"
          className="flex-1"
          onClick={onClose}
        >
          <Link href="/market">مشاهده بازارچه</Link>
        </Button>
      </div>
    </div>
  );
}