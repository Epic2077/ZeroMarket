"use client";

import { Zap } from "lucide-react";
import { toFa } from "@/context/carLabels";
import dynamic from "next/dynamic";

const PriceScatter = dynamic(() => import("../PriceScatter"), { ssr: false });

function formatPriceShort(value: number): string {
  if (value >= 1_000_000_000)
    return toFa((value / 1_000_000_000).toFixed(2)) + " میلیارد";
  return toFa(Math.round(value / 1_000_000)) + " میلیون";
}

interface Props {
  carLabel: string;
  marketAvg: number;
  listings: {
    id: string;
    price: number;
    seller: string;
    status: string;
    city: string;
  }[];
}

export default function PriceScatterSection({
  carLabel,
  marketAvg,
  listings,
}: Props) {
  if (!listings.length) return null;

  return (
    <section>
      <h2 className="flex items-center gap-2 text-lg font-700 text-foreground mb-4">
        <Zap size={18} className="text-warning" />
        تحلیل قیمت — {carLabel}
      </h2>
      <div className="card-elevated p-5">
        <div className="mb-4">
          <p className="text-sm font-700 text-foreground">
            پراکندگی قیمت آگهی‌ها
          </p>
          <p className="text-2xs text-muted-foreground mt-0.5">
            {toFa(listings.length)} آگهی فعال — میانگین بازار:{" "}
            <span className="font-mono text-primary">
              {formatPriceShort(marketAvg)}
            </span>
          </p>
        </div>
        <PriceScatter listings={listings} marketAvg={marketAvg} />
      </div>
    </section>
  );
}
