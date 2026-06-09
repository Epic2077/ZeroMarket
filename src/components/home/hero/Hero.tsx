import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import HeroText from "./HeroText";
import HeroFilter from "./HeroFilter";
import HeroLabels from "./Labels";
import Logo from "@/components/shared/Logo";

export default function Hero() {
  return (
    <BackgroundBeamsWithCollision className="w-full md:h-155 bg-linear-to-l from-[#0EA4E9] to-[#0F2669] flex flex-row-reverse items-center justify-between px-9.5 py-16.5">
      <div className="flex items-center justify-between w-full" dir="rtl">
        <div className="">
          <HeroText />
          <HeroFilter />
          <HeroLabels />
        </div>
        <div className="md:w-[30%] opacity-50">
          <Logo size="large" />
        </div>
      </div>
    </BackgroundBeamsWithCollision>
  );
}
