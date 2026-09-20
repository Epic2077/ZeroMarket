"use client";

import {
  fetchVehicleRequests,
  type VehicleRequestRow,
} from "@/lib/supabase/vehicleRequests";
import {
  ChevronDown,
  ChevronLeft,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const purchaseMethodLabels: Record<string, string> = {
  CASH: "نقدی",
  INSTALLMENT: "اقساطی",
  PRE_SALE: "پیش‌فروش",
  MULTI_STAGE: "چندمرحله‌ای",
};

const statusLabels: Record<string, string> = {
  PENDING: "در انتظار بررسی",
  CONTACTED: "تماس گرفته شده",
  IN_PROGRESS: "در حال پیگیری",
  COMPLETED: "تکمیل شده",
  CANCELLED: "لغو شده",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function VehicleRequestsTab() {
  const [requests, setRequests] = useState<VehicleRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRequests(await fetchVehicleRequests());
    } catch {
      toast.error("خطا در بارگذاری درخواست‌های خودرو");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16">
        <Loader2 size={18} className="animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">در حال بارگذاری…</span>
      </div>
    );
  }

  return (
    <div className="card-elevated overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-700 text-foreground">
          درخواست‌های خودرو ({requests.length.toLocaleString("fa-IR")})
        </h2>
      </div>
      {requests.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-muted-foreground">
          هنوز درخواست خودرویی ثبت نشده است.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {requests.map((request) => {
            const expanded = expandedId === request.id;
            const fullName = `${request.first_name} ${request.last_name}`;
            return (
              <div
                key={request.id}
                className="hover:bg-muted/20 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : request.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-right"
                  aria-expanded={expanded}
                >
                  {expanded ? (
                    <ChevronDown size={17} />
                  ) : (
                    <ChevronLeft size={17} />
                  )}
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                    <User size={17} />
                  </div>
                  <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-700 text-foreground truncate">
                        {fullName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {request.city} · {request.phone}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-700 text-foreground truncate">
                        {request.brand} {request.model}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {purchaseMethodLabels[request.purchase_method] ??
                          request.purchase_method}
                      </div>
                    </div>
                    <div className="sm:text-left">
                      <div className="text-xs font-600 text-primary">
                        {statusLabels[request.status] ?? request.status}
                      </div>
                      <div className="text-2xs text-muted-foreground mt-1">
                        {formatDate(request.created_at)}
                      </div>
                    </div>
                  </div>
                </button>

                {expanded && (
                  <div className="mx-5 mb-4 rounded-xl bg-muted/40 border border-border p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <Detail
                        label="نام و نام خانوادگی"
                        value={fullName}
                        icon={<User size={15} />}
                      />
                      <Detail
                        label="خودرو"
                        value={`${request.brand} ${request.model}`}
                      />
                      <Detail
                        label="روش خرید"
                        value={
                          purchaseMethodLabels[request.purchase_method] ??
                          request.purchase_method
                        }
                      />
                      <Detail
                        label="شهر"
                        value={request.city}
                        icon={<MapPin size={15} />}
                      />
                      <Detail
                        label="شماره تماس"
                        value={request.phone}
                        icon={<Phone size={15} />}
                      />
                      <Detail
                        label="ایمیل حساب"
                        value={request.user_email ?? "ثبت نشده"}
                        icon={<Mail size={15} />}
                      />
                      <Detail
                        label="تاریخ ثبت"
                        value={formatDate(request.created_at)}
                      />
                      <Detail
                        label="آخرین به‌روزرسانی"
                        value={formatDate(request.updated_at)}
                      />
                      <Detail label="شناسه درخواست" value={request.id} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <div className="text-sm font-600 text-foreground wrap-break-word">
        {value}
      </div>
    </div>
  );
}
