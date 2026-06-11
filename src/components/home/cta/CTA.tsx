import { ArrowRight, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function HomeCTA() {
  return (
    <section
      className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-14"
      dir="rtl"
    >
      <div className="rounded-2xl hero-gradient p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
        {/* Background grid */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="cta-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>

        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl lg:text-3xl font-800 text-white mb-3 leading-tight">
            آماده خرید یا فروش خودروی صفرکیلومتر هستید؟
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            به ۱٬۲۴۱ فروشنده تأییدشده و بیش از ۴۰٬۰۰۰ خریدار در تنها پلتفرم
            تخصصی خودروهای صفرکیلومتر بپیوندید.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            href="/listings-marketplace"
            className="flex items-center gap-2 px-5 py-3 bg-white text-primary font-700 text-sm rounded-xl hover:bg-white/90 transition-colors duration-150"
          >
            مرور آگهی‌ها
            <ArrowRight size={15} className="rotate-180" />
          </Link>
          <Link
            href="#register"
            className="flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/25 text-white font-700 text-sm rounded-xl hover:bg-white/20 transition-colors duration-150"
          >
            <PlusCircle size={15} />
            ثبت خودروی شما
          </Link>
        </div>
      </div>
    </section>
  );
}
