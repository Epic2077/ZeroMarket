"use client";

import {
  BANNER_STORAGE_KEY,
  resolveAvatarGradient,
  resolveBannerBackground,
} from "@/context/banners";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface BannerContextValue {
  // slug → chosen preset id or uploaded image data URL (absent → default).
  banners: Record<string, string>;
  setBanner: (slug: string, value: string) => void;
  resetBanner: (slug: string) => void;
  // CSS `background` for the banner (gradient or cover image).
  getBackground: (slug: string) => string;
  // Gradient for the avatar tile (never the uploaded image).
  getAvatarGradient: (slug: string) => string;
}

const BannerContext = createContext<BannerContextValue | null>(null);

export function BannerProvider({ children }: { children: ReactNode }) {
  const [banners, setBanners] = useState<Record<string, string>>({});

  // Hydrate from localStorage after mount (server renders defaults, so no
  // hydration mismatch — customized banners settle in on the client).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(BANNER_STORAGE_KEY);
      if (raw) setBanners(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
  }, []);

  const persist = (next: Record<string, string>) => {
    try {
      localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota/availability errors
    }
  };

  const setBanner = useCallback((slug: string, value: string) => {
    setBanners((prev) => {
      const next = { ...prev, [slug]: value };
      persist(next);
      return next;
    });
  }, []);

  const resetBanner = useCallback((slug: string) => {
    setBanners((prev) => {
      const next = { ...prev };
      delete next[slug];
      persist(next);
      return next;
    });
  }, []);

  const getBackground = useCallback(
    (slug: string) => resolveBannerBackground(slug, banners[slug]),
    [banners],
  );

  const getAvatarGradient = useCallback(
    (slug: string) => resolveAvatarGradient(slug, banners[slug]),
    [banners],
  );

  const value = useMemo<BannerContextValue>(
    () => ({ banners, setBanner, resetBanner, getBackground, getAvatarGradient }),
    [banners, setBanner, resetBanner, getBackground, getAvatarGradient],
  );

  return (
    <BannerContext.Provider value={value}>{children}</BannerContext.Provider>
  );
}

export function useBanners(): BannerContextValue {
  const ctx = useContext(BannerContext);
  if (!ctx) {
    throw new Error("useBanners must be used within a <BannerProvider>");
  }
  return ctx;
}
