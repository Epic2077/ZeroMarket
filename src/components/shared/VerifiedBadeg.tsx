import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

interface VerifiedBadgeProps extends ComponentPropsWithoutRef<"span"> {
  size?: "sm" | "md" | "lg";
}

export default function VerifiedBadge({
  size = "md",
  className,
  ...rest
}: VerifiedBadgeProps) {
  const sizePx = { sm: 14, md: 16, lg: 20 }[size];

  return (
    <span
      title="Verified Seller — Identity confirmed by KhodroJu"
      aria-label="Verified seller"
      {...rest}
    >
      <BadgeCheck
        size={sizePx}
        className={cn("text-primary shrink-0", className)}
        strokeWidth={3}
      />
    </span>
  );
}
