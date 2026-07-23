import { useUserInfo } from "@/context/UserInfoProvider";
import Avatar from "@/components/shared/Avatar";
import { Settings, Store } from "lucide-react";
import Link from "next/link";

export default function UserDashboardHeader() {
  const { profile } = useUserInfo();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <Avatar
          src={profile?.avatar_path}
          name={profile?.full_name}
          size="w-14 h-14"
          className="text-lg"
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-800 text-foreground">
              سلام، {profile?.full_name}
            </h1>
            <div className="bg-muted px-2 py-0.5 rounded-lg text-xs font-600 text-muted-foreground">
              <p>{profile?.role?.toLowerCase()}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            داشبورد خریدار · عضو از{" "}
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString("fa-IR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : ""}
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
