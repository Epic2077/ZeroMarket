"use client";

import ToggleSwitch from "@/components/shared/ToggleSwitch";
import { notificationPrefs } from "@/context/userProfile";
import { useState } from "react";
import { toast } from "sonner";

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState(notificationPrefs);

  const toggle = (id: string, next: boolean) => {
    setPrefs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: next } : p)),
    );
  };

  const handleSave = () => toast.success("تنظیمات اعلان‌ها ذخیره شد");

  return (
    <div className="card-elevated overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm font-700 text-foreground">تنظیمات اعلان‌ها</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          انتخاب کنید کدام رویدادها به شما اطلاع داده شوند.
        </p>
      </div>

      <div className="divide-y divide-border">
        {prefs.map((pref) => (
          <div
            key={pref.id}
            className="flex items-center justify-between gap-4 px-6 py-4"
          >
            <div>
              <div className="text-sm font-600 text-foreground">
                {pref.label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {pref.desc}
              </div>
            </div>
            <ToggleSwitch
              checked={pref.enabled}
              onChange={(next) => toggle(pref.id, next)}
              label={pref.label}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end px-6 py-4 border-t border-border">
        <button onClick={handleSave} className="btn-primary text-sm">
          ذخیره تنظیمات
        </button>
      </div>
    </div>
  );
}
