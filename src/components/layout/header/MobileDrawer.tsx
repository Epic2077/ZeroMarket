"use client";

import { navLinks } from "@/context/Header";
import {
  Crown,
  LayoutDashboardIcon,
  Search,
  ShieldHalf,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SearchModal from "./SearchModal";
import { useUserInfo } from "@/context/UserInfoProvider";

interface MobileDrawerProps {
  setMobileOpen: (open: boolean) => void;
}

export default function MobileDrawer({ setMobileOpen }: MobileDrawerProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, profile } = useUserInfo();
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const initialPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== initialPathname.current) setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [setMobileOpen]);

  return (
    <div
      ref={drawerRef}
      className="fixed inset-x-0 top-16 bottom-0 z-30 overscroll-contain lg:hidden"
    >
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
        onPointerDown={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <div className="relative max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-card shadow-card-hover animate-slide-up">
        <div className="px-4 py-3 flex flex-col gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            className="px-3 py-2.5 text-sm font-500 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150 flex items-center gap-2 text-right"
          >
            <Search size={15} />
            جست‌وجوی خودرو یا فروشنده
          </button>

          {navLinks?.map((link) => (
            <Link
              key={`mobile-nav-${link?.label}`}
              href={link?.href}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 text-sm font-500 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150"
            >
              {link?.label}
            </Link>
          ))}

          {user && (
            <>
              <Link
                href="/dashboard/user"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm font-500 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150 flex items-center gap-2"
              >
                <User size={15} />
                پروفایل کاربری
              </Link>
              <Link
                href="/dashboard/user"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm font-500 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150 flex items-center gap-2"
              >
                <LayoutDashboardIcon size={15} />
                پنل فروش
              </Link>
              {profile?.role === "OWNER" && (
                <Link
                  href="/dashboard/owner"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-500 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150 flex items-center gap-2"
                >
                  <Crown size={15} />
                  پنل مالک
                </Link>
              )}
              {profile?.role === "ADMIN" && (
                <Link
                  href="/dashboard/admin"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-500 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150 flex items-center gap-2"
                >
                  <ShieldHalf size={15} />
                  پنل مدیر
                </Link>
              )}
            </>
          )}
          {!user && (
            <div className="pt-2 border-t border-border flex gap-2 mt-1">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="btn-secondary flex-1 justify-center text-sm"
              >
                ورود
              </Link>
            </div>
          )}
        </div>
      </div>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
