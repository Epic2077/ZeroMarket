import AdminManageButton from "@/components/management/AdminManageButton";
import Avatar from "@/components/shared/Avatar";
import VerifiedBadge from "@/components/shared/VerifiedBadeg";
import { useUserInfo } from "@/context/UserInfoProvider";
import { currentUser } from "@/context/userProfile";
import type { SellerApplicationStatus } from "@/types/user";
import { Clock, LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface Props {
  appStatus: SellerApplicationStatus;
}

export default function ProfileHeader({ appStatus }: Props) {
  const { profile } = useUserInfo();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <Avatar
          src={profile?.avatar_path}
          name={profile?.full_name}
          size="w-16 h-16"
          className="text-xl"
        />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-800 text-foreground">
              {profile?.full_name}
            </h1>

            <span className="status-active">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-success" />
              {profile?.role?.toLowerCase()}
            </span>

            {appStatus === "PENDING" && (
              <span className="status-pending">
                <Clock size={11} />
                در انتظار تأیید شدن
              </span>
            )}
            {profile?.verified && <VerifiedBadge size="md" />}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {profile?.email} · عضو از{" "}
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
        {/* Maps to this member's managed-platform record. */}
        {/* <AdminManageButton userId="usr-nima-asadi" /> */}
        <Link href="/dashboard/user" className="btn-secondary text-sm">
          <LayoutDashboard size={14} />
          داشبورد من
        </Link>
      </div>
    </div>
  );
}
