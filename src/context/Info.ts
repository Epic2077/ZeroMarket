import type { LucideIcon } from "lucide-react";
import { Car, ListChecks, TrendingUp, Users } from "lucide-react";

type InfoItem = {
  title: string;
  description: string;
  footNote: string;
  icon: LucideIcon;
};

export const data: InfoItem[] = [
  {
    title: "2.4 میلیارد",
    description: "میانگین قیمت لیست",
    footNote: "1.8% در مقابل هفته گذشته",
    icon: TrendingUp,
  },
  {
    title: "38",
    description: "برند مورد پوشش داده شده",
    footNote: "تولید داخلی و وارداتی",
    icon: Car,
  },
  {
    title: "241",
    description: "فروشنده تایید شده",
    footNote: "94.32% پاسخگویی",
    icon: Users,
  },
  {
    title: "8,547",
    description: "آگهی فعال",
    footNote: "+143 امروز",
    icon: ListChecks,
  },
];
