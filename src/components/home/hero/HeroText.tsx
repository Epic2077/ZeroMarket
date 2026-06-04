import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

export default function HeroText() {
  return (
    <div className="flex flex-col gap-5 font-dyna" dir="rtl">
      <Badge
        variant="secondary"
        className="w-75 h-7 flex items-center gap-1.5 bg-muted/20 border border-[#837F7F]"
        dir="rtl"
      >
        <Zap className="text-accent w-6 h-6" />
        <p className=" text-white text-sm font-normal">
          ماشین صفر کیلومتر - بازار ماشین های خشک و صفر
        </p>
      </Badge>
      <h1 className=" text-white text-5xl font-bold">
        ماشین های صفر رو اینجا معامله کن <br className="mb-3" />
        <span className="text-accent">مثل حرفه ای ها</span>
      </h1>
      <p className="text-white text-lg">
        آگهی های ساختارمند، معامله گر های ضمانت شده، قیمت های بروز و هوشمند -{" "}
        <br className="mb-1" />
        تنها پلتفرم تخصصی خودرو های صفر کیلومتر کارخانه.
      </p>
    </div>
  );
}
