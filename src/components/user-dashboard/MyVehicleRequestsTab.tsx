"use client";

import { useUserInfo } from "@/context/UserInfoProvider";
import {
  deleteVehicleRequest,
  fetchVehicleRequests,
  type VehicleRequestRow,
} from "@/lib/supabase/vehicleRequests";
import { Loader2, Trash2 } from "lucide-react";
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

export default function MyVehicleRequestsTab() {
  const { user } = useUserInfo();
  const [requests, setRequests] = useState<VehicleRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      setRequests(await fetchVehicleRequests(user.id));
    } catch {
      toast.error("خطا در بارگذاری درخواست‌ها");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (request: VehicleRequestRow) => {
    if (!window.confirm("آیا از حذف این درخواست مطمئن هستید؟")) return;
    setDeletingId(request.id);
    try {
      await deleteVehicleRequest(request.id);
      setRequests((current) =>
        current.filter((item) => item.id !== request.id),
      );
      toast.success("درخواست حذف شد");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "خطا در حذف درخواست",
      );
    } finally {
      setDeletingId(null);
    }
  };

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
          درخواست‌های ثبت‌شده خودرو ({requests.length.toLocaleString("fa-IR")})
        </h2>
      </div>
      {requests.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-muted-foreground">
          هنوز درخواست خودرویی ثبت نکرده‌اید.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
            >
              <div>
                <div className="text-sm font-700 text-foreground">
                  {request.brand} {request.model}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {purchaseMethodLabels[request.purchase_method] ??
                    request.purchase_method}
                  <span className="mx-1.5">·</span>
                  {request.city}
                </div>
                <div className="text-2xs text-muted-foreground mt-1">
                  {formatDate(request.created_at)}
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4">
                <span className="text-xs font-600 text-primary">
                  {statusLabels[request.status] ?? request.status}
                </span>
                <button
                  type="button"
                  onClick={() => void handleDelete(request)}
                  disabled={deletingId === request.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-danger/25 px-3 py-2 text-xs font-600 text-danger hover:bg-danger/10 disabled:opacity-50"
                >
                  {deletingId === request.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
