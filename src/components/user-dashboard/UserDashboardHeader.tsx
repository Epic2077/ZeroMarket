import { currentUser } from "@/context/userProfile";
import { Settings, Store } from "lucide-react";
import Link from "next/link";

export default function UserDashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white font-800 text-lg flex-shrink-0">
          {currentUser.avatar}
        </div>
        <div>
          <h1 className="text-2xl font-800 text-foreground">
            سلام، {currentUser.fullName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            داشبورد خریدار · عضو از {currentUser.memberSince}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/market" className="btn-primary text-sm">
          <Store size={14} />
          مشاهده بازار
        </Link>
        <Link href="/user-profile" className="btn-secondary text-sm">
          <Settings size={14} />
          تنظیمات پروفایل
        </Link>
      </div>
    </div>
  );
}
