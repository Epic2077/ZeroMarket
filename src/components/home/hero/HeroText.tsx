import { Zap } from "lucide-react";

export default function HeroText() {
  return (
    <div className="flex flex-col gap-5 font-dyna" dir="rtl">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20  w-max">
        <Zap size={13} className="text-yellow-300" />
        <span className="text-xs font-600 text-white/90 tracking-wide">
          فقط خودروهای صفرکیلومتر کارخانه — بازار حرفه‌ای
        </span>
      </div>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-800 text-white leading-tight tracking-tight ">
        خودروی نو بخر یا بفروش
        <br />
        <span className="text-accent">مثل یک حرفه‌ای</span>
      </h1>
      <p className="text-base sm:text-lg text-white/70 mb-4 max-w-xl leading-relaxed">
        آگهی‌های ساختارمند، فروشندگان تأییدشده، تحلیل قیمت لحظه‌ای — تنها پلتفرم
        تخصصی خودروهای صفرکیلومتر کارخانه.
      </p>
    </div>
  );
}
