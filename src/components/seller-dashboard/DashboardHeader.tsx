"use client";

import VerifiedBadge from "@/components/shared/VerifiedBadeg";
import { PlusCircle, Settings, Upload } from "lucide-react";
import Link from "next/link";

interface Props {
  onNewPost: () => void;
  onBulkImport: () => void;
}

export default function DashboardHeader({ onNewPost, onBulkImport }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white font-800 text-lg flex-shrink-0">
          آم
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-800 text-foreground">آریا موتورز</h1>
            <VerifiedBadge size="md" />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            داشبورد فروشنده · تهران · عضو از ۱۴۰۰
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/user-profile" className="btn-secondary text-sm">
          <Settings size={14} />
          تنظیمات پروفایل
        </Link>
        <button onClick={onNewPost} className="btn-primary text-sm">
          <PlusCircle size={14} />
          ثبت آگهی جدید
        </button>
        <button onClick={onBulkImport} className="btn-secondary text-sm">
          <Upload size={14} />
          ورود گروهی (اکسل)
        </button>
      </div>
    </div>
  );
}
