"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";

/**
 * Thin top progress bar that animates on route changes.
 * Insert once near the root of the layout tree (e.g. inside <body>).
 */
export default function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = `${pathname}?${searchParams}`;

  const [visible, setVisible] = useState(false);
  const prevKey = useRef(key);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (prevKey.current === key) return;
    prevKey.current = key;

    startTransition(() => setVisible(true));
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 900);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [key]);

  return (
    <div
      role="progressbar"
      aria-hidden={!visible}
      aria-label="در حال بارگذاری"
      className="pointer-events-none fixed top-0 left-0 right-0 z-[9999] h-0.5"
    >
      <div
        className={`h-full bg-primary origin-right transition-transform duration-500 ease-out ${
          visible ? "scale-x-100" : "scale-x-0 duration-200"
        }`}
      />
    </div>
  );
}
