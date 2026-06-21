"use client";

import ToggleSwitch from "@/components/shared/ToggleSwitch";
import { formatPrice } from "@/context/data";
import { priceAlerts } from "@/context/userProfile";
import { Bell, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PriceAlertsTab() {
  const [alerts, setAlerts] = useState(priceAlerts);

  const toggle = (id: string, next: boolean) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: next } : a)),
    );
    toast.success(next ? "هشدار فعال شد" : "هشدار غیرفعال شد");
  };

  const remove = (id: string, title: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success(`هشدار «${title}» حذف شد`);
  };

  return (
    <div className="card-elevated overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-700 text-foreground">
          هشدارهای قیمت ({alerts.length.toLocaleString("fa-IR")})
        </h2>
      </div>

      {alerts.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-muted-foreground">
          هشداری تنظیم نکرده‌اید.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {alerts.map((alert) => {
            // Positive gap → current price is still above the buyer's target.
            const gap = alert.currentPrice - alert.targetPrice;
            const reached = gap <= 0;
            const pct = Math.round((gap / alert.targetPrice) * 100);
            return (
              <div
                key={alert.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-muted/30 transition-colors duration-150"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      alert.active
                        ? "bg-warning/10 text-warning"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Bell size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-700 text-foreground">
                      {alert.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      قیمت هدف:{" "}
                      <span className="font-mono">
                        {formatPrice(alert.targetPrice)} تومان
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-mono font-700 text-foreground">
                    {formatPrice(alert.currentPrice)} تومان
                  </div>
                  <div
                    className={`text-2xs font-600 ${reached ? "text-success" : "text-muted-foreground"}`}
                  >
                    {reached
                      ? "به قیمت هدف رسید"
                      : `${Math.abs(pct).toLocaleString("fa-IR")}٪ بالاتر از هدف`}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <ToggleSwitch
                    checked={alert.active}
                    onChange={(next) => toggle(alert.id, next)}
                    label="فعال‌سازی هشدار"
                  />
                  <button
                    onClick={() => remove(alert.id, alert.title)}
                    aria-label="حذف هشدار"
                    title="حذف هشدار"
                    className="flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-danger hover:border-danger/40 hover:bg-danger/5 transition-colors duration-150"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
