"use client";

import { navLinks } from "@/context/Header";
import { Search, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import SearchModal from "./SearchModal";

interface MobileDrawerProps {
  setMobileOpen: (open: boolean) => void;
}

export default function MobileDrawer({ setMobileOpen }: MobileDrawerProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="lg:hidden bg-card border-t border-border shadow-card-hover animate-slide-up">
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

        <Link
          href="/user-profile"
          onClick={() => setMobileOpen(false)}
          className="px-3 py-2.5 text-sm font-500 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150 flex items-center gap-2"
        >
          <User size={15} />
          پروفایل کاربری
        </Link>
        <div className="pt-2 border-t border-border flex gap-2 mt-1">
          <Link
            href="#login"
            className="btn-secondary flex-1 justify-center text-sm"
          >
            ورود
          </Link>
          <Link
            href="#register"
            className="btn-primary flex-1 justify-center text-sm"
          >
            ثبت آگهی
          </Link>
        </div>
      </div>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
