"use client";

import { FilterState } from "@/types/marketplace";
import { useState } from "react";
import { Button } from "../ui/button";

const defaultFilters: FilterState = {
  search: "",
  brand: "",
  bodyType: "",
  city: "",
  fuelType: "",
  priceMin: "",
  priceMax: "",
  verifiedOnly: false,
  status: "",
  sortBy: "listedDate",
  sortDir: "desc",
};

export default function MarketplaceContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <section
      className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-6 vazir-matn"
      dir="rtl"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-700 text-foreground">
            بازار خودروهای صفرکیلومتر
          </h1>
          {/* <p className="text-sm text-muted-foreground mt-0.5">
          {filtered.length.toLocaleString("fa-IR")} آگهی موجود · بروزرسانی ۲۹
          اردیبهشت ۱۴۰۵ · ۱۰:۱۲
        </p> */}
        </div>

        <Button
          variant="outline"
          className="sticky-filters -mx-4 lg:-mx-8 xl:-mx-10 px-4 lg:px-8 xl:px-10 py-3 mb-4"
        ></Button>
      </div>
    </section>
  );
}
