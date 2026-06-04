interface HeroLabelsProps {
  icon: React.ReactNode;
  title: string;
}

export default function HeroLabels({ icon, title }: HeroLabelsProps) {
  return (
    <div className="flex items-center gap-2 font-dyna" dir="rtl">
      {icon}
      <p className="text-white text-sm  tracking-wider">{title}</p>
    </div>
  );
}
