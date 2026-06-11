import Reveal from "@/components/shared/Reveal";
import { steps } from "@/context/Info";

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-muted/40 border-y border-border py-14 vazir-matn"
      dir="rtl"
    >
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        <Reveal>
          <div className="text-center mb-10">
            <p className="section-label mb-2">فرآیند ساده</p>
            <h2 className="text-2xl font-700 text-foreground">
              زیرومارکت چطور کار می‌کند؟
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
              از مرور تا معامله — کل جریان تراکنش ساختارمند، سریع و شفاف است.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-px bg-border z-0" />

          {steps?.map((step, i) => (
            <Reveal key={step?.id} delay={i * 0.1} className="relative z-10">
              <div className="card-elevated card-hover p-6 h-full">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                    {step?.icon}
                  </div>
                  <span className="font-mono text-3xl font-800 text-border">
                    {step?.number}
                  </span>
                </div>
              </div>
              <h3 className="text-base font-700 text-foreground mb-2 mt-2">
                {step?.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step?.description}
              </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
