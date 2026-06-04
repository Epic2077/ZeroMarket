import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import HeroText from "./HeroText";
import HeroFilter from "./HeroFilter";
import HeroLabels from "./Labels";
import { Shield, TrendingUp, Zap } from "lucide-react";
import Logo from "@/components/shared/logo/Logo";

export default function Hero() {
  return (
    <BackgroundBeamsWithCollision className="w-full md:h-155 bg-linear-to-l from-[#0EA4E9] to-[#0F2669] flex flex-row-reverse items-center justify-between px-9.5 py-16.5">
      <div className="flex items-center justify-between w-full" dir="rtl">
        <div className="">
          <HeroText />
          <HeroFilter />
          <div className="flex items-center gap-5 mt-5" dir="rtl">
            <HeroLabels
              icon={<Shield className="text-accent w-5 h-5" />}
              title=" +100 فروشنده تایید شده "
            />
            <HeroLabels
              icon={<TrendingUp className="text-accent w-5 h-5" />}
              title=" +100 فروشنده تایید شده "
            />
            <HeroLabels
              icon={<Zap className="text-accent w-5 h-5" />}
              title=" +100 فروشنده تایید شده "
            />
          </div>
        </div>
        <div className="md:w-[30%] opacity-50">
          <Logo size="large" title={false} />
        </div>
      </div>
    </BackgroundBeamsWithCollision>
  );
}
