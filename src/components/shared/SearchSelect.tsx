"use client";

import { ChevronDown, Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface SearchSelectProps {
  id?: string;
  label?: string;
  value: string;
  options: string[];
  placeholder?: string;
  emptyText?: string;
  loading?: boolean;
  loadingText?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SearchSelect({
  id,
  label,
  value,
  options,
  placeholder = "انتخاب کنید…",
  emptyText = "موردی یافت نشد",
  loading = false,
  loadingText = "در حال بارگذاری…",
  onChange,
  disabled = false,
  className,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  const highlightMatch = useCallback(
    (text: string) => {
      const q = query.trim();
      if (!q) return text;
      const idx = text.toLowerCase().indexOf(q.toLowerCase());
      if (idx === -1) return text;
      return (
        <>
          {text.slice(0, idx)}
          <mark className="bg-primary/15 text-primary rounded-sm px-0.5">
            {text.slice(idx, idx + q.length)}
          </mark>
          {text.slice(idx + q.length)}
        </>
      );
    },
    [query],
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const select = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-bold text-foreground mb-1.5"
        >
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        disabled={disabled || loading}
        onClick={() => !disabled && !loading && setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 vazir-matn ${
          value ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        <span className="truncate">
          {loading ? loadingText : value || placeholder}
        </span>
        {loading ? (
          <Loader2 size={16} className="shrink-0 text-muted-foreground animate-spin" />
        ) : (
          <ChevronDown
            size={16}
            className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search size={14} className="shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              dir="rtl"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div ref={listRef} className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-muted-foreground">
                {emptyText}
              </p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => select(opt)}
                  className={`w-full text-right px-4 py-2 text-sm transition-colors duration-100 ${
                    opt === value
                      ? "bg-primary/10 text-primary font-600"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {highlightMatch(opt)}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
