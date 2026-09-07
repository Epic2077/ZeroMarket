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
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TaxonomyOptions {
  BRAND: string[];
  CITY: string[];
}

interface HeroFilterProps {
  taxonomy: TaxonomyOptions;
}

export default function HeroFilter({ taxonomy }: HeroFilterProps) {
  const router = useRouter();
  const brandOptions = taxonomy.BRAND ?? [];
  const cityOptions = taxonomy.CITY ?? [];

  const [brand, setBrand] = useState("");
  const [city, setCity] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (brand) params.set("brand", brand);
    if (city) params.set("city", city);
    const query = params.toString();
    router.push(query ? `/market?${query}` : "/market");
  };

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
            <SelectItem key="" value="">
              تمام برندها
            </SelectItem>
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
            <SelectItem key="" value="">
              تمام شهرها
            </SelectItem>
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