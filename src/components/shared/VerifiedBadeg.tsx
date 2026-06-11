import { CheckIcon } from "lucide-react";

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
      className={`verified-badge ${sizeMap[size]}`}
      title="Verified Seller — Identity confirmed by ZeroMarket"
      aria-label="Verified seller"
    >
      <CheckIcon size={iconSize[size]} color="white" strokeWidth={3} />
    </span>
  );
}
