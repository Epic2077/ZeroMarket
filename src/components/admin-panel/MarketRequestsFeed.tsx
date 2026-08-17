"use client";

import StatusBadge from "@/components/shared/StatusBadge";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const faNum = (n: number) => n.toLocaleString("fa-IR");

interface MarketRequest {
  id: string;
  offered_price: number;
  message: string | null;
  status: string;
  created_at: string;
  buyer: { full_name: string } | null;
  seller: { full_name: string } | null;
  listing: { brand: string; model: string; year: number; trim: string } | null;
}

const STATUS_MAP: Record<
  string,
  "active" | "pending" | "sold" | "negotiable" | "reserved" | "completed"
> = {
  WAITING: "pending",
  ACCEPTED: "approved" as "active",
  NEGOTIABLE: "negotiable",
  REJECTED: "declined" as "sold",
  COMPLETED: "completed",
};

function persianDate(iso: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const PAGE_SIZES = [10, 20, 50];

export default function MarketRequestsFeed() {
  const [requests, setRequests] = useState<MarketRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters + pagination
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Debounced search input
  const [searchInput, setSearchInput] = useState("");

  const fetchPage = useCallback(
    async (p: number, ps: number, s: string, df: string, dt: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(p),
          pageSize: String(ps),
        });
        if (s.trim()) params.set("search", s.trim());
        if (df) params.set("dateFrom", df);
        if (dt) params.set("dateTo", dt);

        const res = await fetch(`/api/admin/market-requests?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setRequests(data.requests ?? []);
        setTotal(data.total ?? 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطا");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch when filters/pagination change
  useEffect(() => {
    void fetchPage(page, pageSize, search, dateFrom, dateTo);
  }, [fetchPage, page, pageSize, search, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearchInput("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (error) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/5 p-8 text-center">
        <p className="text-sm text-danger mb-3">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary text-xs"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-muted/30 rounded-xl">
        <div className="relative flex-1 min-w-50">
          <Search
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="جستجوی خریدار، فروشنده یا محصول…"
            className="w-full pr-9 pl-3 py-2 text-xs border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">از تاریخ</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="px-2 py-1.5 text-xs border border-border rounded-lg bg-card"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">تا تاریخ</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="px-2 py-1.5 text-xs border border-border rounded-lg bg-card"
          />
        </div>
        {(search || dateFrom || dateTo) && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={12} />
            پاک‌کردن فیلترها
          </button>
        )}
      </div>

      {/* Loading overlay */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16">
          <Loader2 size={18} className="animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            در حال بارگذاری…
          </span>
        </div>
      ) : (
        <>
          {/* Count */}
          <p className="text-xs text-muted-foreground mb-3">
            نمایش {faNum(from)}–{faNum(to)} از {faNum(total)} تراکنش
          </p>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                  <th className="text-right py-2.5 px-3 font-600">خریدار</th>
                  <th className="text-right py-2.5 px-3 font-600">فروشنده</th>
                  <th className="text-right py-2.5 px-3 font-600">محصول</th>
                  <th className="text-right py-2.5 px-3 font-600">پیشنهاد</th>
                  <th className="text-right py-2.5 px-3 font-600">وضعیت</th>
                  <th className="text-right py-2.5 px-3 font-600">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      تراکنشی یافت نشد
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => {
                    const listingTitle = r.listing
                      ? `${r.listing.brand} ${r.listing.model}`
                      : "—";
                    return (
                      <tr
                        key={r.id}
                        className="border-b border-border/60 hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-600 text-foreground">
                          {r.buyer?.full_name ?? "—"}
                        </td>
                        <td className="py-2.5 px-3">
                          <Link
                            href={`/sellers/${r.seller?.full_name ?? ""}`}
                            className="text-primary hover:underline"
                          >
                            {r.seller?.full_name ?? "—"}
                          </Link>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="truncate max-w-37.5 block">
                            {listingTitle}
                          </span>
                          {r.listing?.trim && (
                            <span className="text-2xs text-muted-foreground">
                              {r.listing.trim} · {r.listing.year}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums">
                          {r.offered_price.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge
                            status={STATUS_MAP[r.status] ?? "pending"}
                          />
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground tabular-nums">
                          {persianDate(r.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                تعداد در صفحه
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 text-xs border border-border rounded-lg bg-card"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {faNum(s)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
              >
                <ChevronsRight size={14} />
              </button>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
              <span className="px-2 text-xs text-muted-foreground tabular-nums">
                صفحه {faNum(page)} از {faNum(totalPages)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
              >
                <ChevronsLeft size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
