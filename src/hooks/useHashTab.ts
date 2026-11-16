"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Keeps an active tab id in sync with the URL hash (e.g. `#users`) so the
 * selected tab survives a refresh and browser back/forward. `validTabs` is the
 * list of allowed ids; `aliases` maps legacy/alternate hashes to a tab id
 * (e.g. `#notif` → `notifications`).
 */
export function useHashTab<T extends string>(
  defaultTab: T,
  validTabs: readonly T[],
  aliases?: Readonly<Record<string, T>>,
): [T, (tab: T) => void] {
  const [tab, setTab] = useState<T>(defaultTab);

  useEffect(() => {
    const resolve = (hash: string): T | null => {
      const id = hash.replace(/^#/, "");
      if (!id) return null;
      if (aliases && id in aliases) return aliases[id];
      return (validTabs as readonly string[]).includes(id) ? (id as T) : null;
    };

    const applyHash = () => {
      const next = resolve(window.location.hash);
      if (next) setTab(next);
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [validTabs, aliases]);

  const select = useCallback((next: T) => {
    setTab(next);
    const target = `#${next}`;
    if (window.location.hash !== target) {
      window.history.replaceState(null, "", target);
    }
  }, []);

  return [tab, select];
}
