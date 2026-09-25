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
    <div className=" max-w-screen fixed top-0 left-0 right-0 z-20 bg-card border-b border-border h-16 shadow-card vazir-matn ">
      <div className="mx-auto flex h-full min-w-0 max-w-screen-2xl items-center justify-between gap-2  px-3 sm:gap-4 sm:px-4 lg:px-8 xl:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="flex min-w-0 max-w-32 shrink-0 items-center gap-2 sm:max-w-36"
        >
          <Logo size={150} className="max-w-full" />
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
