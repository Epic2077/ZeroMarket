import { BadgeCheck, CheckIcon } from "lucide-react";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
}

export default function VerifiedBadge({ size = "md" }: VerifiedBadgeProps) {
  const sizeMap = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };
  const iconSize = { sm: 8, md: 10, lg: 12 };
  return (
    <span
      title="Verified Seller — Identity confirmed by ZeroMarket"
      aria-label="Verified seller"
    >
      {/* <CheckIcon  color="white" strokeWidth={3} /> */}
      <BadgeCheck
        size={sizeMap[size]}
        className="h-4 w-4 text-blue-500 shrink-0"
        strokeWidth={3}
      />
    </span>
  );
}
