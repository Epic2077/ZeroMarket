interface BrandIconProps {
  brand: string;
}

export default function BrandIcon({ brand }: BrandIconProps) {
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
      className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-lg text-xs font-bold -mr-5"
      style={brandLogoStyle(brand)}
    >
      {initials}
    </div>
  );
}
