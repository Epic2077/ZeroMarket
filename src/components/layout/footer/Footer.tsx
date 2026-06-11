import React from "react";
import Link from "next/link";
import { Shield, CheckCircle, Zap } from "lucide-react";
import Logo from "@/components/shared/Logo";

export default function Footer() {
  return (
    <section className="bg-foreground text-white mt-20">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Logo size={28} />
              <span className="font-extrabold text-lg tracking-tight">
                زیرو<span className="text-accent">مارکت</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              تنها بازار تخصصی خرید و فروش خودروهای صفرکیلومتر کارخانه‌ای با
              استانداردهای بازار مالی.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Shield size={13} className="text-accent" />
                فقط فروشندگان تأییدشده
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle size={13} className="text-success" />
                فقط خودروهای صفرکیلومتر کارخانه
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Zap size={13} className="text-warning" />
                تحلیل قیمت لحظه‌ای
              </div>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <p className="section-label text-slate-500 mb-3">بازار خودرو</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "مرور آگهی‌ها", href: "/listings-marketplace" },
                { label: "تحلیل قیمت", href: "#price-insights" },
                { label: "فروشندگان تأییدشده", href: "#sellers" },
                { label: "تازه‌واردها", href: "/listings-marketplace" },
                { label: "برندهای برتر", href: "/listings-marketplace" },
              ]?.map((item) => (
                <Link
                  key={`footer-mkt-${item?.label}`}
                  href={item?.href}
                  className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                >
                  {item?.label}
                </Link>
              ))}
            </div>
          </div>

          {/* For Sellers */}
          <div>
            <p className="section-label text-slate-500 mb-3">برای فروشندگان</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "ثبت آگهی", href: "#register" },
                { label: "ورود گروهی (اکسل)", href: "#" },
                { label: "داشبورد فروشنده", href: "/seller-dashboard" },
                { label: "دریافت تأییدیه", href: "/user-profile" },
                { label: "ابزار قیمت‌گذاری", href: "#" },
              ]?.map((item) => (
                <Link
                  key={`footer-sell-${item?.label}`}
                  href={item?.href}
                  className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                >
                  {item?.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="section-label text-slate-500 mb-3">شرکت</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "درباره زیرومارکت", href: "#" },
                { label: "اعتماد و امنیت", href: "#" },
                { label: "مرکز راهنمایی", href: "#" },
                { label: "شرایط استفاده", href: "#" },
                { label: "حریم خصوصی", href: "#" },
              ]?.map((item) => (
                <Link
                  key={`footer-co-${item?.label}`}
                  href={item?.href}
                  className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                >
                  {item?.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © ۱۴۰۵ زیرومارکت. تمامی حقوق محفوظ است. فقط خودروهای صفرکیلومتر
            کارخانه.
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse"></span>
            پلتفرم فعال · ۹۹.۸٪ آپتایم
          </div>
        </div>
      </div>
    </section>
  );
}
