"use client";

import { Button } from "@/components/ui/button";
import NewPostModal from "@/components/seller-dashboard/NewPostModal";
import { useState } from "react";

export default function PostAdButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="default"
        onClick={() => setOpen(true)}
        className="py-2 px-4 text-sm hover:bg-primary/90 transition-colors duration-150 hidden sm:flex"
      >
        ثبت آگهی
      </Button>
      {open && <NewPostModal onClose={() => setOpen(false)} />}
    </>
  );
}
