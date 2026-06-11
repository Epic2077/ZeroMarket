import HomeCTA from "@/components/home/cta/CTA";
import Hero from "@/components/home/hero/Hero";
import HowItWorks from "@/components/home/howItWorks/HowItWorks";
import InfoSection from "@/components/home/info/InfoSection";
import TableRender from "@/components/home/Latest/TableRender";
import PriceInsightWidget from "@/components/home/PricingInsight/PricingInsightWidget";
import VerifiedSellers from "@/components/home/verifiedSellers/VerifiedSellers";
import Reveal from "@/components/shared/Reveal";

export default function Home() {
  return (
    <div>
      <main>
        <Hero />
        <Reveal>
          <InfoSection />
        </Reveal>
        <Reveal>
          <TableRender />
        </Reveal>
        <Reveal>
          <PriceInsightWidget />
        </Reveal>
        <VerifiedSellers />
        <HowItWorks />
        <Reveal>
          <HomeCTA />
        </Reveal>
      </main>
    </div>
  );
}
