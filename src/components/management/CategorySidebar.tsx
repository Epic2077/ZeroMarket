"use client";

import { Tags } from "lucide-react";
import { taxonomyCategoryMeta } from "@/lib/supabase/taxonomy";
import { TaxonomyCategory } from "@/lib/supabase/taxonomy";

interface CategorySidebarProps {
  active: TaxonomyCategory;
  onSelect: (cat: TaxonomyCategory) => void;
  getCount: (cat: TaxonomyCategory) => number;
}

export function CategorySidebar({ active, onSelect, getCount }: CategorySidebarProps) {
  return (
    <div className="card-elevated h-fit p-3">
      <div className="flex items-center gap-1.5 px-2 py-1.5 mb-1 text-xs font-700 text-muted-foreground">
        <Tags size={14} />
        دسته‌بندی گزینه‌ها
      </div>
      <div className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
        {taxonomyCategoryMeta.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-right text-sm font-600 transition-colors duration-150 ${
              active === cat.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {cat.label}
            <span className="mr-1 text-2xs text-muted-foreground">
              ({getCount(cat.id).toLocaleString("fa-IR")})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}