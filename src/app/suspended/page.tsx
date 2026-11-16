"use client";

import { toFa } from "@/context/carLabels";
import { useUserInfo } from "@/context/UserInfoProvider";
import { Ban, LogOut, PhoneCall } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SuspendedPage() {
  const { profile, signOut } = useUserInfo();
  const router = useRouter();

  // If somehow the user becomes active again, redirect to dashboard
  useEffect(() => {
    if (profile && profile.status !== "SUSPENDED") {
      router.replace("/dashboard/user");
    }
  }, [profile, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
          <Ban size={36} className="text-danger" />
        </div>

        <h1 className="text-2xl font-800 text-foreground mb-2">
          حساب کاربری شما معلق شده است
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          دسترسی شما به خودروجو به طور موقت محدود شده است. اگر فکر می‌کنید این
          محدودیت اشتباهاً اعمال شده، لطفاً با تیم مدیریت از طریق راه‌های
          ارتباطی موجود در سایت تماس بگیرید تا موضوع بررسی شود.
        </p>

        <section className="relative mb-8 overflow-hidden rounded-2xl border border-primary/20 bg-primary/4 p-5 shadow-sm sm:p-6">
          <div className="pointer-events-none absolute -left-12 -top-16 size-40 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                <PhoneCall size={20} />
              </div>
              <div>
                <p className="mb-1 text-xs font-800 tracking-wide text-primary">
                  پشتیبانی خودروجو
                </p>
                <h2 className="text-base font-800 text-foreground sm:text-lg">
                  برای راهنمایی، با ما در تماس باشید
                </h2>
                <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
                  کارشناسان ما آماده پاسخ‌گویی به پرسش‌های شما هستند.
                </p>
              </div>
            </div>
            <a
              href="tel:09179449399"
              dir="ltr"
              className="group flex w-full items-center justify-between gap-4 rounded-xl border border-primary/20 bg-card px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:w-auto sm:min-w-56 sm:flex-col sm:items-end sm:gap-0"
            >
              <span className="text-2xs font-700 text-muted-foreground">
                تماس مستقیم
              </span>
              <span className="text-xl font-900 tracking-wide text-primary transition-colors group-hover:text-primary/75 sm:text-2xl">
                {toFa("09179449399")}
              </span>
            </a>
          </div>
        </section>

        <button
          onClick={async () => {
            await signOut();
            // Hard redirect clears browser history so back button can't return
            window.location.replace("/auth/login");
          }}
          className="btn-secondary inline-flex items-center gap-2 text-sm"
        >
          <LogOut size={16} />
          خروج از حساب
        </button>
      </div>
    </div>
  );
}
