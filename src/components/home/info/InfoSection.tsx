import { toFa } from "@/context/carLabels";
import {
  Car,
  CheckCircle,
  ListChecks,
  Search,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface HomepageStats {
  active_posts_count: number;
  today_new_posts: number;
  total_sellers: number;
  avg_response_rate: number;
  supported_brands: number;
  avg_post_price: number;
  price_change_since_last_week: number;
}

function formatAvgPrice(value: number): string {
  if (value >= 1_000_000_000) {
    return `${toFa((value / 1_000_000_000).toFixed(1))} میلیارد`;
  }
  if (value >= 1_000_000) {
    return `${toFa(Math.round(value / 1_000_000))} میلیون`;
  }
  return toFa(value);
}

function formatPercent(value: number): string {
  return toFa(value.toFixed(1)) + "%";
}

function getStatsItems(stats: HomepageStats | null, loading: boolean) {
  const s = stats ?? {
    active_posts_count: 0,
    today_new_posts: 0,
    total_sellers: 0,
    avg_response_rate: 0,
    supported_brands: 0,
    avg_post_price: 0,
    price_change_since_last_week: 0,
  };

  const prevWeekPrice = s.avg_post_price - s.price_change_since_last_week;
  const priceChangePercent =
    prevWeekPrice !== 0
      ? (s.price_change_since_last_week / prevWeekPrice) * 100
      : 0;
  const priceChangeLabel = `${priceChangePercent >= 0 ? "+" : ""}${formatPercent(priceChangePercent)}`;

  return [
    {
      id: "stat-listings",
      icon: <ListChecks size={22} className="text-primary" />,
      value: loading ? (
        <Spinner className="w-5 h-5" />
      ) : (
        toFa(s.active_posts_count)
      ),
      label: "آگهی فعال",
      sub: `+${loading ? <Spinner className="w-5 h-5" /> : toFa(s.today_new_posts)} امروز`,
      positive: true,
    },
    {
      id: "stat-sellers",
      icon: <Users size={22} className="text-accent" />,
      value: loading ? <Spinner className="w-5 h-5" /> : toFa(s.total_sellers),
      label: "فروشنده تأییدشده",
      sub: `${loading ? <Spinner className="w-5 h-5" /> : formatPercent(s.avg_response_rate)} نرخ پاسخ`,
      positive: true,
    },
    {
      id: "stat-brands",
      icon: <Car size={22} className="text-success" />,
      value: loading ? (
        <Spinner className="w-5 h-5" />
      ) : (
        toFa(s.supported_brands)
      ),
      label: "برند پوشش‌داده‌شده",
      sub: "داخلی و وارداتی",
      positive: true,
    },
    {
      id: "stat-avg",
      icon: <TrendingUp size={22} className="text-warning" />,
      value: loading ? (
        <Spinner className="w-5 h-5" />
      ) : (
        formatAvgPrice(s.avg_post_price)
      ),
      label: "میانگین قیمت آگهی",
      sub: `${loading ? <Spinner className="w-5 h-5" /> : priceChangeLabel} نسبت به هفته قبل`,
      positive: s.price_change_since_last_week >= 0,
    },
  ];
}

interface InfoSectionProps {
  stats: HomepageStats | null;
}

export default function InfoSection({ stats }: InfoSectionProps) {
  const loading = !stats;
  const items = getStatsItems(stats, loading);

  return (
    <section className="bg-card border-b border-border" dir="rtl">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
          {items.map((stat) => (
            <div key={stat?.id} className="px-6 py-5 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                {stat?.icon}
              </div>
              <div>
                <div className="stat-value text-2xl">{stat?.value}</div>
                <div className="text-xs font-600 text-muted-foreground mt-0.5 ">
                  {stat?.label}
                </div>
                <div
                  className={`text-xs md:text-sm font-500 mt-0.5 ${stat?.positive ? "text-success" : "text-danger"}`}
                >
                  {stat?.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
