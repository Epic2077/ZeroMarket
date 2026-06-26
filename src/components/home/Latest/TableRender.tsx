"use client";

import { LatestTableColumns, latestTableData } from "@/context/latestTable";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import LatestTable from "./Table";

export default function TableRender() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-14 vazir-matn" dir="rtl">
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
      <LatestTable columns={LatestTableColumns} data={latestTableData} />
    </div>
  );
}
