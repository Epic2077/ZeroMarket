import HeroText from "./HeroText";
import HeroFilter from "./HeroFilter";
import HeroLabels from "./Labels";
import Logo from "@/components/shared/Logo";

export default function Hero() {
  return (
    <div className="w-full h-155 bg-linear-to-r from-[#0EA4E9] to-[#0F2669] flex items-center justify-between px-4 py-10 sm:px-6 md:px-9.5 md:py-16.5">
      <div
        className="flex flex-col md:flex-row items-center justify-between w-full gap-10 md:gap-0"
        dir="rtl"
      >
        <div className="w-full md:w-auto">
          <HeroText />
          <HeroFilter />
          <HeroLabels />
        </div>
        <div className="w-[55%] hidden md:w-[30%] opacity-50 md:flex justify-center">
          <Logo size="large" />
        </div>
      </div>
    </div>
  );
}
