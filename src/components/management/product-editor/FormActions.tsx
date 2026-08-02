"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  backHref: string;
  isSubmitting: boolean;
  listing?: { id: string };
}

export function FormActions({ backHref, isSubmitting, listing }: FormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Link href={backHref} className="btn-secondary text-sm">
        انصراف
      </Link>
      <Button type="submit" disabled={isSubmitting} className="btn-primary text-sm">
        {listing ? "ذخیره تغییرات" : "ثبت محصول"}
      </Button>
    </div>
  );
}