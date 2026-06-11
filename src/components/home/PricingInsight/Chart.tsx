import { ChevronRight } from "lucide-react";
import Link from "next/link";
import PriceInsightChart from "./PriceInsightChart";

export default function Chart() {
  return (
    <div className="lg:w-2/3 w-full">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-700 text-white">
              روند قیمت ۷ روزه (×۱۰ میلیون تومان)
            </div>
            <div className="text-2xs text-slate-400 mt-0.5">
              تویوتا کمری · هیوندای توسان · کیا اسپورتیج
            </div>
          </div>
          <Link
            href="#"
            className="flex items-center gap-1 text-xs text-accent font-600 hover:underline"
          >
            گزارش کامل <ChevronRight size={12} className="rotate-180" />
          </Link>
        </div>
        <PriceInsightChart />
      </div>
    </div>
  );
}
