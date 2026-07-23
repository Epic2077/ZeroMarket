import { useUserInfo } from "@/context/UserInfoProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LayoutDashboardIcon, User } from "lucide-react";
import Link from "next/link";

const linkClass =
  "hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-600 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150";

export default function Profile() {
  const { user, profile } = useUserInfo();

  // Compute role-based dashboard link above the JSX so you can use if/else freely
  let dashboardLink: React.ReactNode = null;

  if (profile?.role === "ADMIN") {
    dashboardLink = (
      <Link href="/dashboard/admin" className={linkClass}>
        <LayoutDashboardIcon size={15} />
        پنل مدیریت
      </Link>
    );
  } else if (profile?.role === "OWNER") {
    dashboardLink = (
      <DropdownMenu>
        <DropdownMenuTrigger className={linkClass}>
          <LayoutDashboardIcon size={15} />
          پنل‌ها
          <ChevronDown size={12} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 mt-5">
          <DropdownMenuItem asChild>
            <Link href="/dashboard/owner">پنل مالک</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/admin">پنل مدیریت</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/seller">پنل فروش</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/user">پروفایل کاربری</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  } else if (profile?.role === "USER") {
    dashboardLink = (
      <Link href="/dashboard/seller" className={linkClass}>
        <LayoutDashboardIcon size={15} />
        پنل فروش
      </Link>
    );
  }

  return (
    <>
      {user && (
        <div className="flex items-center gap-2">
          <Link href="/dashboard/user" className={linkClass}>
            <User size={15} />
            پروفایل
          </Link>
          {dashboardLink}
        </div>
      )}
    </>
  );
}
