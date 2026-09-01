// Banner (cover) presets for seller storefronts. The marketplace is front-end
// only, so a chosen banner is persisted to localStorage via BannerProvider and
// keyed by seller slug. When a seller hasn't picked one, a deterministic
// gradient derived from the slug is used so every storefront still looks unique.

export interface BannerPreset {
  id: string;
  label: string;
  gradient: string;
}

export const bannerPresets: BannerPreset[] = [
  {
    id: "ocean",
    label: "اقیانوس",
    gradient: "linear-gradient(135deg,#0ea5e9,#1b4fd8)",
  },
  {
    id: "emerald",
    label: "زمرد",
    gradient: "linear-gradient(135deg,#10b981,#0ea5e9)",
  },
  {
    id: "violet",
    label: "بنفش",
    gradient: "linear-gradient(135deg,#8b5cf6,#1b4fd8)",
  },
  {
    id: "sunset",
    label: "غروب",
    gradient: "linear-gradient(135deg,#f59e0b,#ef4444)",
  },
  {
    id: "rose",
    label: "ارغوانی",
    gradient: "linear-gradient(135deg,#ec4899,#8b5cf6)",
  },
  {
    id: "gold",
    label: "طلایی",
    gradient: "linear-gradient(135deg,#f59e0b,#b45309)",
  },
  {
    id: "teal",
    label: "فیروزه‌ای",
    gradient: "linear-gradient(135deg,#14b8a6,#0f766e)",
  },
  {
    id: "graphite",
    label: "گرافیت",
    gradient: "linear-gradient(135deg,#334155,#0f172a)",
  },
];

// localStorage key for the slug → bannerId map.
export const BANNER_STORAGE_KEY = "KhodroJu:seller-banners";

// The seller identity the profile-settings editor manages (mock "self"; matches
// the seller dashboard's CURRENT_SELLER_ID → "usr-aria-motors").
export const CURRENT_SELLER_SLUG = "aria-motors";

// A stored banner value is either a preset id, an uploaded image (data URL,
// starts with "data:"), or absent (use the deterministic default).
const isCustomImage = (value?: string): boolean =>
  !!value && value.startsWith("data:");

// Deterministic fallback gradient derived from the slug (stable across renders).
export function defaultBannerGradient(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 62%, 48%), hsl(${(hue + 40) % 360}, 70%, 38%))`;
}

// CSS `background` value for the banner — a gradient for presets/defaults, or a
// cover-fitted image for an uploaded custom banner.
export function resolveBannerBackground(slug: string, value?: string): string {
  if (isCustomImage(value)) {
    return `url("${value}") center / cover no-repeat`;
  }
  const preset = bannerPresets.find((p) => p.id === value);
  return preset ? preset.gradient : defaultBannerGradient(slug);
}

// The avatar tile always uses a gradient — never the uploaded image, which would
// look like an arbitrary crop at avatar size.
export function resolveAvatarGradient(slug: string, value?: string): string {
  const preset = bannerPresets.find((p) => p.id === value);
  return preset ? preset.gradient : defaultBannerGradient(slug);
}

export { isCustomImage };
