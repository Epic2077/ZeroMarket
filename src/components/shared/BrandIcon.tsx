interface BrandIconProps {
  brand: string;
  size?: "sm" | "md" | "lg";
}

export default function BrandIcon({ brand, size = "md" }: BrandIconProps) {
  const sizeMap = {
    sm: "w-8 h-8 text-[9px]",
    md: "w-9 h-9 text-[10px]",
    lg: "w-12 h-12 text-sm",
  };

  function brandLogoStyle(brand: string): {
    backgroundColor: string;
    color: string;
  } {
    let hash = 0;
    for (let i = 0; i < brand.length; i++) {
      hash = brand.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return { backgroundColor: `hsl(${hue}, 60%, 48%)`, color: "#ffffff" };
  }

  const initials = brand.slice(0, 3).toUpperCase();
  return (
    <div
      className={`flex ${sizeMap[size]} shrink-0 select-none items-center justify-center rounded-lg text-xs font-bold -mr-5 ${sizeMap[size]}`}
      style={brandLogoStyle(brand)}
    >
      {initials}
    </div>
  );
}
