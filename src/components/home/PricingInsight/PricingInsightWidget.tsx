import { Lock, TrendingUp } from "lucide-react";
import ModelPriceRow from "./ModelPriceRow";
import Chart from "./Chart";

export default function PriceInsightWidget() {
  return (
    <section className="bg-foreground py-14 vazir-matn">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        <div className="flex flex-col lg:flex-row gap-8 items-center" dir="rtl">
          {/* Left */}
          <div className="lg:w-1/3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-4">
              <TrendingUp size={13} className="text-accent" />
              <span className="text-xs font-600 text-accent tracking-wide">
                هوش قیمت‌گذاری
              </span>
            </div>
            <h2 className="text-2xl font-700 text-white mb-3">
              تحلیل قیمت بازار
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              میانگین قیمت خرید/فروش هر مدل، روند ۷ روزه و شاخص‌های بازار را
              ببینید — تا همیشه بدانید آیا یک آگهی قیمت مناسبی دارد.
            </p>

            {/* Model price rows */}
            <ModelPriceRow />

            {/* Premium lock */}
            <div className="flex items-center gap-3 p-3 bg-warning/10 border border-warning/20 rounded-xl">
              <Lock size={16} className="text-warning shrink-0" />
              <div>
                <div className="text-xs font-700 text-warning">
                  تحلیل کامل — ویژه
                </div>
                <div className="text-2xs text-slate-400 mt-0.5">
                  تاریخچه ۳۰ روزه، مقایسه مدل‌ها، خروجی
                </div>
              </div>
            </div>
          </div>
          <Chart />
        </div>
      </div>
    </section>
  );
}
