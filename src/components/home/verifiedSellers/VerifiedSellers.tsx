import Reveal from "@/components/shared/Reveal";
import VerifiedBadge from "@/components/shared/VerifiedBadeg";
import { sellers } from "@/context/topSellers";
import { ListChecks, Star } from "lucide-react";

export default function VerifiedSellers() {
  return (
    <section
      id="sellers"
      className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-14 vazir-matn"
      dir="rtl"
    >
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="section-label mb-1">شبکه اعتماد</p>
            <h2 className="text-2xl font-700 text-foreground">
              فروشندگان برتر تأییدشده
            </h2>
          </div>
          <button className="btn-secondary text-sm">
            مشاهده همه فروشندگان
          </button>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {sellers?.map((seller, i) => (
          <Reveal key={seller?.id} delay={i * 0.08}>
            <div className="card-elevated card-hover p-5 cursor-pointer h-full">
            {/* Avatar + name */}
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-800 text-sm flex-shrink-0"
                style={{ backgroundColor: seller?.color }}
              >
                {seller?.initials}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-700 text-foreground leading-tight">
                    {seller?.name}
                  </span>
                  <VerifiedBadge size="sm" />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {seller?.city} · از {seller?.since}
                </div>
              </div>
            </div>

            {/* Specialty */}
            <div className="text-xs text-muted-foreground mb-3 bg-muted rounded-lg px-2.5 py-1.5">
              {seller?.specialty}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5">
                <ListChecks size={13} className="text-primary" />
                <div>
                  <div className="text-sm font-700 text-foreground">
                    {seller?.listings}
                  </div>
                  <div className="text-2xs text-muted-foreground">
                    آگهی فعال
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Star size={13} className="text-warning" />
                <div>
                  <div className="text-sm font-700 text-foreground">
                    {seller?.responseRate}٪
                  </div>
                  <div className="text-2xs text-muted-foreground">نرخ پاسخ</div>
                </div>
              </div>
            </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
