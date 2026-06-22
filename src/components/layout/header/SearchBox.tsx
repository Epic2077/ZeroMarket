"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";
import SearchModal from "./SearchModal";

export default function SearchBox() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted border border-border rounded-lg hover:border-primary/40 transition-colors duration-150"
      >
        <Search size={14} />
        <span className="text-xs">جستجوی آگهی…</span>
      </Button>
      {open && <SearchModal onClose={() => setOpen(false)} />}
    </>
  );
}
