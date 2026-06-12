"use client";

import {
  bodyTypeOptions,
  brandOptions,
  cityOptions,
  fuelTypeOptions,
  statusOptions,
  type SelectOption,
} from "@/context/marketFilters";
import { FilterState } from "@/types/marketplace";
import { ChevronDown, Search, Shield, X } from "lucide-react";

interface Props {
  filters: FilterState;
  onUpdate: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onReset: () => void;
  activeCount: number;
  totalResults: number;
}

const fieldClass =
  "h-8 rounded-lg border border-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/30";

const SelectField = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${fieldClass} appearance-none pl-3 pr-7 py-1.5 font-500 text-foreground cursor-pointer min-w-[110px]`}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={`opt-${placeholder}-${o.value}`} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <ChevronDown
      size={11}
      className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
    />
  </div>
);

export default function MarketplaceFilters({
  filters,
  onUpdate,
  onReset,
  activeCount,
  totalResults,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search
          size={13}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onUpdate("search", e.target.value)}
          placeholder="جستجوی برند، مدل، فروشنده…"
          className={`${fieldClass} pr-8 pl-3 py-1.5 w-52`}
        />
        {filters.search && (
          <button
            onClick={() => onUpdate("search", "")}
            className="absolute left-2 top-1/2 -translate-y-1/2"
            aria-label="پاک کردن جستجو"
          >
            <X
              size={11}
              className="text-muted-foreground hover:text-foreground"
            />
          </button>
        )}
      </div>

      <SelectField
        value={filters.brand}
        onChange={(v) => onUpdate("brand", v)}
        options={brandOptions}
        placeholder="برند"
      />
      <SelectField
        value={filters.bodyType}
        onChange={(v) => onUpdate("bodyType", v)}
        options={bodyTypeOptions}
        placeholder="نوع بدنه"
      />
      <SelectField
        value={filters.city}
        onChange={(v) => onUpdate("city", v)}
        options={cityOptions}
        placeholder="شهر"
      />
      <SelectField
        value={filters.fuelType}
        onChange={(v) => onUpdate("fuelType", v)}
        options={fuelTypeOptions}
        placeholder="نوع سوخت"
      />
      <SelectField
        value={filters.status}
        onChange={(v) => onUpdate("status", v)}
        options={statusOptions}
        placeholder="وضعیت"
      />

      {/* Price range (in billions of Toman) */}
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={filters.priceMin}
          onChange={(e) => onUpdate("priceMin", e.target.value)}
          placeholder="حداقل (میلیارد)"
          className={`${fieldClass} w-24 px-2 py-1.5 font-mono`}
        />
        <span className="text-xs text-muted-foreground">–</span>
        <input
          type="number"
          value={filters.priceMax}
          onChange={(e) => onUpdate("priceMax", e.target.value)}
          placeholder="حداکثر (میلیارد)"
          className={`${fieldClass} w-24 px-2 py-1.5 font-mono`}
        />
      </div>

      {/* Verified toggle */}
      <button
        onClick={() => onUpdate("verifiedOnly", !filters.verifiedOnly)}
        className={`flex items-center gap-1.5 h-8 px-3 text-xs font-600 rounded-lg border transition-colors duration-150 ${
          filters.verifiedOnly
            ? "bg-accent/10 border-accent/30 text-accent"
            : "bg-card border-border text-muted-foreground hover:text-foreground"
        }`}
      >
        <Shield size={12} />
        فقط تأییدشده
      </button>

      {/* Active filter count + reset */}
      {activeCount > 0 && (
        <div className="flex items-center gap-2 ml-1">
          <span className="text-2xs font-700 text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {activeCount.toLocaleString("fa-IR")} فیلتر
          </span>
          <button
            onClick={onReset}
            className="text-xs text-danger font-600 hover:underline flex items-center gap-1"
          >
            <X size={11} /> پاک کردن همه
          </button>
        </div>
      )}

      {/* Result count */}
      <div className="ml-auto text-xs text-muted-foreground font-500">
        <span className="font-mono font-700 text-foreground">
          {totalResults.toLocaleString("fa-IR")}
        </span>{" "}
        نتیجه
      </div>
    </div>
  );
}
