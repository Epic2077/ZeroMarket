import Hero from "@/components/home/hero/Hero";
import InfoSection from "@/components/home/info/InfoSection";
import TableRender from "@/components/home/Latest/TableRender";

export default function Home() {
  return (
    <div>
      <main>
        <Hero />
        <InfoSection />
        <TableRender />
      </main>
    </div>
  );
}
