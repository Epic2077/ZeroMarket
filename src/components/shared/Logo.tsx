"use client";

import React, { memo, useMemo } from "react";
import AppImage from "./AppImage";
import AppIcon from "./AppIcon";

interface LogoProps {
  src?: string; // Image source (optional)
  iconName?: string; // Icon name when no image
  size?: number | "small" | "medium" | "large"; // Size for icon/image
  className?: string; // Additional classes
  onClick?: () => void; // Click handler
}

const logoSizeMap: Record<Exclude<LogoProps["size"], number>, number> = {
  small: 32,
  medium: 64,
  large: 230,
};

const Logo = memo(function Logo({
  src = "/assets/images/app_logo.png",
  iconName = "SparklesIcon",
  size = 64,
  className = "",
  onClick,
}: LogoProps) {
  // Memoize className calculation
  const resolvedSize =
    typeof size === "number" ? size : (logoSizeMap[size] ?? 64);

  const containerClassName = useMemo(() => {
    const classes = ["flex items-center"];
    if (onClick)
      classes.push("cursor-pointer hover:opacity-80 transition-opacity");
    if (className) classes.push(className);
    return classes.join(" ");
  }, [onClick, className]);

  return (
    <div className={containerClassName} onClick={onClick}>
      {/* Show image if src provided, otherwise show icon */}
      {src ? (
        <AppImage
          src={src}
          alt="Logo"
          width={resolvedSize}
          height={resolvedSize}
          className="flex-shrink-0"
          priority={true}
          unoptimized={src.endsWith(".svg")}
        />
      ) : (
        <AppIcon
          name={iconName}
          size={resolvedSize}
          className="flex-shrink-0"
        />
      )}
    </div>
  );
});

export default Logo;
