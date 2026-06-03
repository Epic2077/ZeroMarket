import Image from "next/image";

interface LogoProps {
  size: "small" | "medium" | "large";
  title?: boolean;
}

export default function Logo({ size, title = false }: LogoProps) {
  const sizeClasses = {
    small: "w-10 h-11",
    medium: "w-16 h-16",
    large: "w-[306px] h-[330px]",
  };

  return (
    <div className="flex items-center gap-2.5" dir="rtl">
      <div className={`relative ${sizeClasses[size]}`}>
        <Image
          src="/logo/logo.png"
          alt="Logo"
          className={sizeClasses[size]}
          fill
        />
      </div>
      {title && (
        <span className="ml-2 font-black text-black text-[21px] font-dyna ">
          زیرو<span className="text-primary">مارکت</span>
        </span>
      )}
    </div>
  );
}
