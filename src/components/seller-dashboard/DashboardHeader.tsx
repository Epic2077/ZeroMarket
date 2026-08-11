"use client";

import VerifiedBadge from "@/components/shared/VerifiedBadeg";
import { PlusCircle, Settings, Upload } from "lucide-react";
import Link from "next/link";
import Avatar from "../shared/Avatar";
import { useUserInfo } from "@/context/UserInfoProvider";
import { useSeller } from "@/hooks/useSellers";
import { Spinner } from "../ui/spinner";

interface Props {
  onBulkImport: () => void;
}

export default function DashboardHeader({ onBulkImport }: Props) {
  const { profile, loading: userLoading } = useUserInfo();
  const { seller, loading: sellerLoading } = useSeller(profile?.id ?? "");
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <Avatar
          src={profile?.avatar_path}
          name={profile?.full_name}
          size="h-16 w-16"
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-800 text-foreground">
              {userLoading ? <Spinner /> : profile?.full_name}
            </h1>
            {profile?.verified && <VerifiedBadge size="md" />}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            داشبورد فروشنده ·{" "}
            <span>{sellerLoading ? <Spinner /> : seller?.city}</span> · عضو از{" "}
            <span>
              {userLoading ? (
                <Spinner />
              ) : profile?.created_at ? (
                new Date(profile.created_at).toLocaleDateString("fa-IR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              ) : (
                ""
              )}
            </span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/user-profile" className="btn-secondary text-sm">
          <Settings size={14} />
          تنظیمات پروفایل
        </Link>
        <Link
          href="/dashboard/seller/products/new"
          className="btn-primary text-sm"
        >
          <PlusCircle size={14} />
          ثبت آگهی جدید
        </Link>
        <button onClick={onBulkImport} className="btn-secondary text-sm">
          <Upload size={14} />
          ورود گروهی (اکسل)
        </button>
      </div>
    </div>
  );
}
