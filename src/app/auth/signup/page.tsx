import { SignupForm } from "@/components/auth/signup-form";
import Logo from "@/components/shared/Logo";
import { Car } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 vazir-matn" dir="rtl">
      {/* ── Brand / decorative panel ── */}
      <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden hero-gradient p-10">
        <div className="absolute top-[-20%] right-[-15%] size-[500px] rounded-full bg-white/[0.06]" />
        <div className="absolute bottom-[-10%] left-[-10%] size-[350px] rounded-full bg-white/[0.08]" />
        <div className="absolute top-[40%] left-[20%] size-[200px] rounded-full bg-accent/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center gap-6 text-center reveal-in">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <Logo size="large" />
          </div>

          <div>
            <h2 className="font-dyna text-3xl text-white font-700 tracking-tight">
              ZeroMarket
            </h2>
            <p className="mt-2 text-sm text-white/70 leading-relaxed max-w-xs">
              همین حالا ثبت‌نام کنید و به جمع خریداران و فروشندگان حرفه‌ای
              بپیوندید.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: "⚡", label: "ثبت‌نام رایگان" },
              { icon: "🔒", label: "امن و مطمئن" },
              { icon: "🚀", label: "شروع سریع" },
            ].map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm"
              >
                <span>{f.icon}</span>
                {f.label}
              </span>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-2 text-2xs text-white/50">
            <Car size={12} />
            <span>صفرکیلومتر، بدون واسطه</span>
          </div>
        </div>
      </div>

      {/* ── Form side ── */}
      <div className="flex flex-col items-center justify-center gap-6 bg-background p-6 md:p-10 mt-10">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium lg:hidden"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Logo size="small" />
          </div>
          <span className="font-dyna text-lg text-foreground font-700">
            ZeroMarket
          </span>
        </Link>

        <SignupForm />
      </div>
    </div>
  );
}
