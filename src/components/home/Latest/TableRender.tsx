"use client";

import { Badge } from "@/components/ui/badge";
import {
  brandLogoStyle,
  formatCost,
  LatestTableColumns,
  latestTableData,
  statusMap,
} from "@/context/latestTable";
import { toFa } from "@/context/carLabels";
import { ArrowLeft, BadgeCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import LatestTable from "./Table";

export default function TableRender() {
  return (
    <div
      className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-14 vazir-matn"
      dir="rtl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label mb-1">بازار زنده</p>
          <h2 className="text-2xl font-700 text-foreground">
            آخرین آگهی‌های صفر کیلومتر
          </h2>
        </div>
        <Link href="/market" className="btn-secondary text-sm">
          مشاهده همه
          <ArrowLeft size={14} />
        </Link>
      </div>
      <LatestTable
        columns={LatestTableColumns}
        data={latestTableData}
        renderMobileRow={(row) => {
          const status = statusMap[row.status];
          return (
            <div
              key={row.id}
              className="group rounded-2xl border border-border/70 bg-gradient-to-br from-background via-background to-muted/30 p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                    style={brandLogoStyle(row.brand)}
                  >
                    {row.brand.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground">
                      {row.brand}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {row.trim}
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">قیمت</div>
                  <div className="text-sm font-semibold tabular-nums">
                    {formatCost(row.cost)}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {status && (
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </Badge>
                )}
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {row.seller}
                  {row.verified && (
                    <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">سال ساخت</span>
                  <span className="font-medium tabular-nums">
                    {toFa(row.year)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">رنگ</span>
                  <span className="font-medium">{row.color}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  شناسه {toFa(row.id)}
                </span>
                <Link
                  href={`/market/listings/${row.id}`}
                  className="btn-secondary text-xs px-2.5 py-1.5 inline-flex items-center gap-1.5"
                >
                  مشاهده
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
