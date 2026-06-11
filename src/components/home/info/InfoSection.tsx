import { stats } from "@/context/Info";

export default function InfoSection() {
  return (
    <section className="bg-card border-b border-border" dir="rtl">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
          {stats?.map((stat) => (
            <div key={stat?.id} className="px-6 py-5 flex items-center gap-6">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                {stat?.icon}
              </div>
              <div>
                <div className="stat-value text-2xl">{stat?.value}</div>
                <div className="text-xs font-600 text-muted-foreground mt-0.5">
                  {stat?.label}
                </div>
                <div
                  className={`text-2xs font-500 mt-0.5 ${stat?.positive ? "text-success" : "text-danger"}`}
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
