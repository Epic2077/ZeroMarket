"use client";

import { LatestTableColumns, latestTableData } from "@/context/latestTable";
import LatestTable from "./Table";
import { Clock } from "lucide-react";

export default function TableRender() {
  const tableData = latestTableData;
  const columns = LatestTableColumns;

  return (
    <div className="container mx-auto py-10 w-[90%]" dir="rtl">
      <div className="mb-6 mt-4">
        <p className="text-[14px] text-muted-foreground">بازار زنده</p>
        <h2 className="font-dyna text-2xl text-secondary-foreground">
          آخرین آگهی های صفر کیلومتر
        </h2>
      </div>
      <LatestTable columns={columns} data={tableData} />
      <p className="text-[14px] text-muted-foreground mt-4 flex items-center gap-1">
        <Clock className="inline-block w-4 h-4 ml-1 text-muted-foreground vazir-matn" />
        آخرین بروزرسانی: 29 اردیبهشت 1405، 10:12 - داده ها هر 10 ثانیه بروز
        میشوند.
      </p>
    </div>
  );
}
