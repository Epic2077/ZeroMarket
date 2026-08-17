"use client";

import NewPriceAlertModal from "./NewPriceAlertModal";
import ToggleSwitch from "@/components/shared/ToggleSwitch";
import { useUserInfo } from "@/context/UserInfoProvider";
import { toFa } from "@/context/carLabels";
import {
  fetchPriceAlerts,
  fetchMatchingListings,
  togglePriceAlert,
  deletePriceAlert,
  type PriceAlertRow,
} from "@/lib/supabase/priceAlerts";
import { listingRowToListing, type ListingRow } from "@/lib/supabase/listings";
import type { Listing } from "@/types/dataTypes";
import {
  Bell,
  ChevronDown,
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function formatPriceFa(price: number): string {
  if (price >= 1_000_000_000) {
    return `${toFa((price / 1_000_000_000).toFixed(2))} میلیارد`;
  }
  if (price >= 1_000_000) {
    return `${toFa(Math.round(price / 1_000_000))} میلیون`;
  }
  return toFa(price);
}

export default function PriceAlertsTab() {
  const { user } = useUserInfo();
  const [alerts, setAlerts] = useState<PriceAlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Expanded matching listings per alert.
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, Listing[]>>({});
  const [matchesLoading, setMatchesLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setAlerts(await fetchPriceAlerts(user.id));
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleExpand = async (alert: PriceAlertRow) => {
    if (expandedId === alert.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(alert.id);
    if (matches[alert.id]) return;

    setMatchesLoading(true);
    try {
      const rows = await fetchMatchingListings(
        alert.brand,
        alert.model,
        alert.year,
        alert.target_price,
      );
      setMatches((prev) => ({
        ...prev,
        [alert.id]: rows.map((row) => listingRowToListing(row)),
      }));
    } catch {
      setMatches((prev) => ({ ...prev, [alert.id]: [] }));
    } finally {
      setMatchesLoading(false);
    }
  };

  const toggle = async (id: string, next: boolean) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_active: next } : a)),
    );
    try {
      await togglePriceAlert(id, next);
      toast.success(next ? "هشدار فعال شد" : "هشدار غیرفعال شد");
    } catch (err) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_active: !next } : a)),
      );
      toast.error(err instanceof Error ? err.message : "خطا در تغییر وضعیت");
    }
  };

  const remove = async (id: string, title: string) => {
    try {
      await deletePriceAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      toast.success(`هشدار «${title}» حذف شد`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در حذف هشدار");
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
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-700 text-foreground">
          هشدارهای قیمت ({alerts.length.toLocaleString("fa-IR")})
        </h2>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn-primary text-sm"
        >
          <Plus size={16} />
          ثبت هشدار جدید
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-muted-foreground">
          هشداری تنظیم نکرده‌اید.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {alerts.map((alert) => {
            const current = alert.current_price ?? alert.target_price;
            const gap = current - alert.target_price;
            const reached = gap <= 0;
            const pct = alert.target_price
              ? Math.round((gap / alert.target_price) * 100)
              : 0;
            const isExpanded = expandedId === alert.id;
            const alertMatches = matches[alert.id] ?? [];
            return (
              <div key={alert.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-muted/30 transition-colors duration-150">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        alert.is_active
                          ? "bg-warning/10 text-warning"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Bell size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-700 text-foreground">
                        {alert.brand} {alert.model}
                        {alert.year && (
                          <span className="text-xs text-muted-foreground font-500 mr-1">
                            · {toFa(alert.year)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        قیمت هدف:{" "}
                        <span className="font-mono">
                          {formatPriceFa(alert.target_price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-mono font-700 text-foreground">
                      {formatPriceFa(current)}
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
                      checked={alert.is_active}
                      onChange={(next) => toggle(alert.id, next)}
                      label="فعال‌سازی هشدار"
                    />
                    <button
                      onClick={() => toggleExpand(alert)}
                      aria-label="نمایش آگهی‌های نزدیک"
                      title="نمایش آگهی‌های نزدیک"
                      className="flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors duration-150"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    <button
                      onClick={() =>
                        remove(alert.id, `${alert.brand} ${alert.model}`)
                      }
                      aria-label="حذف هشدار"
                      title="حذف هشدار"
                      className="flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-danger hover:border-danger/40 hover:bg-danger/5 transition-colors duration-150"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Matching listings dropdown */}
                {isExpanded && (
                  <div className="px-5 pb-4 bg-muted/20">
                    {matchesLoading ? (
                      <div className="flex items-center gap-2 py-3">
                        <Loader2
                          size={14}
                          className="animate-spin text-primary"
                        />
                        <span className="text-xs text-muted-foreground">
                          در حال دریافت آگهی‌های نزدیک…
                        </span>
                      </div>
                    ) : alertMatches.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-3">
                        آگهی نزدیک به این قیمت هدف پیدا نشد.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2 pt-3">
                        <p className="text-2xs font-700 text-muted-foreground">
                          {alertMatches.length.toLocaleString("fa-IR")} آگهی
                          نزدیک به قیمت هدف
                        </p>
                        {alertMatches.map((listing) => {
                          const diff = listing.price - alert.target_price;
                          const isBelow = diff <= 0;
                          return (
                            <Link
                              key={listing.id}
                              href={`/market/listings/${listing.id}`}
                              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5 hover:border-primary/30 transition-colors duration-150"
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-700 text-foreground truncate">
                                  {listing.brand} {listing.model} {listing.trim}
                                </div>
                                <div className="text-2xs text-muted-foreground">
                                  {listing.year} · {listing.city}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono text-xs font-700 text-foreground">
                                  {formatPriceFa(listing.price)}
                                </span>
                                <span
                                  className={`text-2xs font-600 ${isBelow ? "text-success" : "text-danger"}`}
                                >
                                  {isBelow ? "" : "+"}
                                  {Math.abs(
                                    Math.round(
                                      (diff / alert.target_price) * 100,
                                    ),
                                  ).toLocaleString("fa-IR")}
                                  ٪
                                </span>
                                <ExternalLink
                                  size={12}
                                  className="text-muted-foreground"
                                />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isCreateOpen && (
        <NewPriceAlertModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={load}
        />
      )}
    </div>
  );
}
