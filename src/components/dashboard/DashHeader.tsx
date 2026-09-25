"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserInfo } from "@/context/UserInfoProvider";
import { useSession } from "@/context/SessionProvider";
import { useSeller } from "@/hooks/useSellers";
import {
  ChevronDown,
  LogOut,
  LogOutIcon,
  PlusCircle,
  Settings,
  Store,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { Spinner } from "../ui/spinner";
import VerifiedBadge from "../shared/VerifiedBadeg";
import Avatar from "../shared/Avatar";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "../ui/skeleton";

interface Props {
  onBulkImport: () => void;
}

export default function DashHeader({ onBulkImport }: Props) {
  const { signOut, profile, loading: userLoading } = useUserInfo();
  const { role } = useSession();
  const { seller, loading: sellerLoading } = useSeller(profile?.id ?? "");
  const loading = userLoading && sellerLoading ? true : false;
  const navigate = useRouter();

  const isAdminOrOwner = role === "admin" || role === "owner";

  const logout = () => {
    signOut();
    navigate.push("/");
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        {loading ? (
          <Skeleton className="h-16 w-16 rounded-3xl " />
        ) : (
          <Avatar
            src={profile?.avatar_path}
            name={profile?.full_name}
            size="h-16 w-16"
          />
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-800 text-foreground">
              {loading ? <Skeleton className="w-48 h-8" /> : profile?.full_name}
            </h1>
            <div className="bg-muted px-2 py-0.5 rounded-lg text-xs font-600 text-muted-foreground">
              <p>{profile?.role.toLowerCase()}</p>
            </div>
            {profile?.verified && <VerifiedBadge size="md" />}
          </div>
          {loading ? (
            <Skeleton className="w-24 h-4 bg-muted animate-pulse" />
          ) : (
            <p className="text-sm text-muted-foreground mt-0.5">
              داشبورد کاربری · {seller && <span>{seller.city} · </span>}عضو از{" "}
              <span>
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("fa-IR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : ""}
              </span>
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="btn-secondary text-sm">
            عملیات
            <ChevronDown size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 mt-2">
            <DropdownMenuItem asChild>
              <Link href="/user-profile">
                <Settings size={14} />
                تنظیمات پروفایل
              </Link>
            </DropdownMenuItem>
            {seller ? (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/seller/products/new">
                    <PlusCircle size={14} />
                    ثبت آگهی جدید
                  </Link>
                </DropdownMenuItem>
                {isAdminOrOwner && (
                  <DropdownMenuItem onSelect={onBulkImport}>
                    <Upload size={14} />
                    ورود گروهی (اکسل)
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/market">
                    <Store size={14} />
                    مشاهده بازار
                  </Link>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem asChild>
                <Link href="/market">
                  <Store size={14} />
                  مشاهده بازار
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          onClick={logout}
          variant={"destructive"}
          size="lg"
          className="btn-secondary border-destructive! text-destructive!"
        >
          <LogOutIcon />
          خروج
        </Button>
      </div>
    </div>
  );
}
