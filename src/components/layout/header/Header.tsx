"use client";

import Logo from "@/components/shared/Logo";
import Link from "next/link";
import Bookmarks from "./Bookmarks";
import SearchBox from "./SearchBox";
import Notification from "./Notifation";
import Profile from "./Profile";
import AuthHeader from "./Auth";
import { useState } from "react";
import MobileDrawer from "./MobileDrawer";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-16 shadow-card vazir-matn">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo size={100} />
        </Link>

        {/* Navigation Links */}
        <Bookmarks />

        {/* User Actions */}
        <div className="flex items-center gap-2">
          <SearchBox />
          <Notification />
          <Profile />
          <AuthHeader />
          <div className="md:hidden">
            <Button
              variant="default"
              // onClick={() => setOpen(true)}
              onClick={() =>
                (window.location.href = "/dashboard/seller/products/new")
              }
              className="btn-primary flex-1 justify-center text-sm"
            >
              ثبت آگهی
            </Button>
          </div>

          {/* Mobile hamburger */}
          <Button
            variant="outline"
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors duration-150"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>
      {mobileOpen && <MobileDrawer setMobileOpen={setMobileOpen} />}
    </div>
  );
}
