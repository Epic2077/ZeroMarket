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

export default function HeroFilter() {
  return (
    <div
      dir="rtl"
      className="flex px-3 py-2.5 items-center justify-between bg-secondary rounded-[15px] mt-5"
    >
      <Select dir="rtl">
        <SelectTrigger className="w-58 h-9.25 text-[16px] font-dyna">
          <SelectValue placeholder="تمامی برند ها" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="text-black">برند ها</SelectLabel>
            <SelectItem value="brand1">برند 1</SelectItem>
            <SelectItem value="brand2">برند 2</SelectItem>
            <SelectItem value="brand3">برند 3</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select dir="rtl">
        <SelectTrigger className="w-53.25 h-9.25 text-[16px] font-dyna">
          <SelectValue placeholder="همه شهر ها" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="text-black">شهر ها</SelectLabel>
            <SelectItem value="city1">شهر 1</SelectItem>
            <SelectItem value="brand2">برند 2</SelectItem>
            <SelectItem value="brand3">برند 3</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        variant="default"
        className="bg-primary text-secondary w-33.25 h-9.25"
      >
        <Search className="w-5 h-5" />
        <p className="font-bold text-sm font-dyna">جستجو در لیست</p>
      </Button>
    </div>
  );
}
