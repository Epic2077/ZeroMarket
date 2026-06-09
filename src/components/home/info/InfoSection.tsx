import { data } from "@/context/Info";

export default function InfoSection() {
  return (
    <section className="grid md:grid-cols-2 xl:grid-cols-4 rtl" dir="rtl">
      {data.map(({ icon: Icon, title, description, footNote }) => (
        <article
          key={title}
          className="
           border border-border border-t-0 border-r-0 bg-white/5 p-5 flex items-center backdrop-blur-sm "
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted-foreground text-accent">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1 mr-6 vazir-matn">
            <h3 className="text-4xl font-medium tracking-wider">{title}</h3>
            <p className=" text-sm text-muted">{description}</p>
            <p className=" text-sm text-[#668B2B]">{footNote}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
