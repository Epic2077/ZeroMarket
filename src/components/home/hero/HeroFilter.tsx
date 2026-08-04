"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaxonomyOptions } from "@/hooks/useTaxonomyOptions";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function HeroFilter() {
  const router = useRouter();
  const { values, loading } = useTaxonomyOptions();

  const [brand, setBrand] = useState("");
  const [city, setCity] = useState("");

  const brandOptions = useMemo(() => values("BRAND"), [values]);
  const cityOptions = useMemo(() => values("CITY"), [values]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (brand) params.set("brand", brand);
    if (city) params.set("city", city);
    const query = params.toString();
    router.push(query ? `/market?${query}` : "/market");
  };

  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex gap-3 px-3 py-2.5 items-center bg-secondary rounded-[15px] mt-5 w-full sm:w-max animate-pulse"
      >
        <div className="h-9.25 w-full sm:w-58 bg-muted rounded-lg" />
        <div className="h-9.25 w-full sm:w-53.25 bg-muted rounded-lg" />
        <div className="h-9.25 w-full sm:w-33.25 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="flex flex-col sm:flex-row flex-wrap gap-3 px-3 py-2.5 items-stretch sm:items-center justify-between bg-secondary rounded-[15px] mt-5 w-full sm:w-max"
    >
      <Select dir="rtl" value={brand} onValueChange={setBrand}>
        <SelectTrigger className="w-full sm:w-58 h-9.25 text-[16px] vazir-matn">
          <SelectValue placeholder="تمامی برند ها" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="text-black">برند ها</SelectLabel>
            {brandOptions.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select dir="rtl" value={city} onValueChange={setCity}>
        <SelectTrigger className="w-full sm:w-53.25 h-9.25 text-[16px] vazir-matn">
          <SelectValue placeholder="همه شهر ها" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="text-black">شهر ها</SelectLabel>
            {cityOptions.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        variant="default"
        className="bg-primary text-secondary w-full sm:w-33.25 h-9.25 hover:bg-primary/90 transition-colors duration-150"
        onClick={handleSearch}
      >
        <Search className="w-5 h-5" />
        <p className="font-bold text-sm vazir-matn">جستجو در لیست</p>
      </Button>
    </div>
  );
}
