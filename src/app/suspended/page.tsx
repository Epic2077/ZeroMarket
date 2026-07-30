"use client";

import { useUserInfo } from "@/context/UserInfoProvider";
import { Ban, LogOut } from "lucide-react";
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
          دسترسی شما به زِرو‌مارکت به طور موقت محدود شده است. اگر فکر می‌کنید
          این محدودیت اشتباهاً اعمال شده، لطفاً با تیم مدیریت از طریق راه‌های
          ارتباطی موجود در سایت تماس بگیرید تا موضوع بررسی شود.
        </p>

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
