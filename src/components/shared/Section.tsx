"use client";

import type { ReactNode } from "react";

interface SectionProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Section({ icon, title, children, className }: SectionProps) {
  return (
    <div className={`card-elevated p-5 ${className ?? ""}`}>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-base font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}