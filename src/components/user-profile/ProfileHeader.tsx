import AdminManageButton from "@/components/management/AdminManageButton";
import VerifiedBadge from "@/components/shared/VerifiedBadeg";
import { currentUser } from "@/context/userProfile";
import type { SellerApplicationStatus } from "@/types/user";
import { Clock, LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface Props {
  appStatus: SellerApplicationStatus;
}

export default function ProfileHeader({ appStatus }: Props) {
  const isSeller = currentUser.role === "seller" || appStatus === "approved";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white font-800 text-xl flex-shrink-0">
          {currentUser.avatar}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-800 text-foreground">
              {currentUser.fullName}
            </h1>
            {isSeller ? (
              <span className="status-active">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-success" />
                فروشنده
              </span>
            ) : (
              <span className="filter-chip">خریدار</span>
            )}
            {appStatus === "pending" && (
              <span className="status-pending">
                <Clock size={11} />
                در انتظار تأیید فروشنده
              </span>
            )}
            {isSeller && currentUser.verified && <VerifiedBadge size="md" />}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {currentUser.email} · عضو از {currentUser.memberSince}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Maps to this member's managed-platform record. */}
        <AdminManageButton userId="usr-nima-asadi" />
        <Link href="/dashboard/user" className="btn-secondary text-sm">
          <LayoutDashboard size={14} />
          داشبورد من
        </Link>
      </div>
    </div>
  );
}
