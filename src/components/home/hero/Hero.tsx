import HeroFilter from "./HeroFilter";
import HeroLabels from "./Labels";
import HeroStatsPanel from "./HeroStatsPanel";
import HeroText from "./HeroText";

interface HeroProps {
  taxonomy: {
    BRAND: string[];
    CITY: string[];
  };
  listings: {
    id: string;
    brand: string;
    model: string;
    trim: string;
    year: number;
    color: string;
    colorHex: string;
    engine: string;
    transmission: string;
    fuelType: string;
    bodyType: string;
    city: string;
    deliveryDays: number;
    sellerName: string;
    sellerVerified: boolean;
    sellerResponseRate: number;
    sellerMemberSince: string;
    sellerActiveListings: number;
    sellerAvatar: string | null;
    price: number;
    priceUnit: string;
    status: string;
    listedDate: string;
    factoryOptions: string[];
    marketAvgBuy: number;
    marketAvgSell: number;
    priceVsMarket: number;
    trend7d: number;
    listingType: "SELL" | "BUY";
    deletedAt: string | null;
  }[];
}

export default function Hero({ taxonomy, listings }: HeroProps) {
  return (
    <div className="relative w-full min-h-160 bg-linear-to-br from-accent via-primary to-[#060f28] overflow-hidden flex items-center px-4 py-16 sm:px-6 md:px-9.5">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <svg className="absolute inset-0 w-full h-full opacity-[0.09]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
        <div className="absolute -top-40 -right-40 w-150 h-150 rounded-full bg-primary/50 blur-[130px]" />
        <div className="absolute bottom-0 -left-20 w-112.5 h-112.5 rounded-full bg-accent/30 blur-[110px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 rounded-full bg-white/4 blur-[90px]" />
      </div>

      <div
        className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-screen-2xl mx-auto gap-12"
        dir="rtl"
      >
        <div className="w-full md:w-[55%]">
          <HeroText />
          <HeroFilter taxonomy={taxonomy} />
          <HeroLabels />
        </div>
        <div className="hidden md:flex md:w-[40%] justify-center">
          <HeroStatsPanel listings={listings} />
        </div>
      </div>
    </div>
  );
}