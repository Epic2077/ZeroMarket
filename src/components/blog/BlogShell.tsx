import Link from "next/link";
import type { ReactNode } from "react";

interface BlogShellProps {
  title: string;
  description: string;
  children: ReactNode;
  rightRail: ReactNode;
  leftRail: ReactNode;
}

export default function BlogShell({
  title,
  description,
  children,
  rightRail,
  leftRail,
}: BlogShellProps) {
  return (
    <section
      className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-6 vazir-matn"
      dir="rtl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div className="space-y-2">
          <span className="section-label">وبلاگ زیرومارکت</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-800 text-foreground">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 max-w-2xl">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link href="/blog/notifications" className="btn-secondary text-sm">
            اعلان‌ها
          </Link>
          <Link href="/blog/agencies" className="btn-primary text-sm">
            آژانس‌های تأییدشده
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        <aside className="order-2 xl:order-1 xl:w-72 shrink-0">
          {rightRail}
        </aside>
        <main className="order-1 xl:order-2 min-w-0 flex-1">{children}</main>
        <aside className="order-3 xl:order-3 xl:w-72 shrink-0">
          {leftRail}
        </aside>
      </div>
    </section>
  );
}
