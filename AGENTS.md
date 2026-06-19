<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ZeroMarket (زیرومارکت)

ZeroMarket is a marketplace for **brand-new, zero-kilometer factory cars** in Iran. Buyers browse structured listings from verified dealers, compare against live market price insights, and submit purchase/negotiation requests; sellers manage listings and incoming requests from a dashboard.

The entire UI is **Persian (Farsi) and right-to-left**. Almost every top-level container sets `dir="rtl"`. This is a front-end-only project today — all data is mock data in `src/context/`; there is no backend or database.

## Tech stack

- **Next.js 16** (App Router, Turbopack) — `npm run dev`, `npm run build`. `params` is a `Promise` you must `await` (see `node_modules/next/dist/docs/`).
- **React 19** + **TypeScript** (strict). Path alias: `@/*` → `src/*`.
- **Tailwind CSS v4** (`@import "tailwindcss"` in `globals.css`; no `tailwind.config.js` — theme/tokens live in CSS via `@theme inline`). Plus `tw-animate-css`.
- **shadcn/ui** primitives in `src/components/ui/`, built on the unified **`radix-ui`** package (import as `import { Checkbox as CheckboxPrimitive } from "radix-ui"` → `CheckboxPrimitive.Root`).
- **lucide-react** for icons.
- **@tanstack/react-table** for data tables (sorting, pagination, row selection).
- **recharts** for charts.
- **motion** (Framer Motion v12, `motion/react`) for animation — but see "Scroll reveal" gotcha below.

## Project structure & conventions

```
src/
  app/                      # routes (thin pages only)
    page.tsx                # home
    market/page.tsx         # marketplace  → <MarketplaceContent />
    market/listings/[id]/page.tsx   # listing detail (server component, awaits params)
    dashboard/seller/page.tsx       # seller dashboard → <SellerDashboard />
    layout.tsx, globals.css, not-found.tsx
  components/
    ui/                     # shadcn primitives (button, table, select, card, collapsible, checkbox…)
    shared/                 # cross-feature pieces (Logo, AppImage, BrandIcon, VerifiedBadeg, StatusBadge, Reveal)
    layout/                 # header/, footer/
    home/                   # home-page sections (hero/, info/, Latest/, PricingInsight/, verifiedSellers/, howItWorks/, cta/)
    market/                 # marketplace feature
    listings-detail/        # listing detail feature
    seller-dashboard/       # seller dashboard feature
  context/                  # data layer: mock data, constants, Farsi label maps, formatters
  types/                    # shared TS types (dataTypes.ts → Listing, marketplace.ts → FilterState)
```

**Core conventions — follow these when adding code:**

- **Thin pages.** Files in `src/app/**/page.tsx` should just compose components. Put the real UI in a feature folder under `src/components/<feature>/` (e.g. `market/page.tsx` renders `<MarketplaceContent />`).
- **Data lives in `src/context/`**, never inlined in components. Each feature has a data module (`data.ts`, `sellerDashboard.tsx`, `marketFilters.ts`, `listingTable.tsx`, etc.) exporting typed arrays, Farsi label maps, and formatters. Data files may contain JSX (icons) → use `.tsx`.
- **One section = one component**, rendered by mapping over data. Keep `"use client"` on the smallest component that needs interactivity (state/handlers); keep section/leaf components as server components where possible.
- **Reuse `shared/` and `ui/`** instead of re-implementing badges, icons, images, etc.
- Match the surrounding file's import order, naming, and Tailwind usage. Match comment density (sparse).

## Design system

Tokens are defined in [`src/app/globals.css`](src/app/globals.css) as CSS variables and exposed to Tailwind through `@theme inline`. **Use the semantic tokens and utility classes below — do not hardcode hex colors.**

### Color tokens (light theme; dark theme is currently commented out)

| Token | Value | Use |
|-------|-------|-----|
| `primary` | `#1b4fd8` | brand blue, primary actions |
| `accent` | `#0ea5e9` | sky accent, highlights |
| `success` | `#10b981` | positive / approved |
| `warning` | `#f59e0b` | caution |
| `danger` | `#ef4444` | destructive / rejected |
| `negotiable` | `#8b5cf6` | "negotiable" state (violet) |
| `background` `#f8fafc`, `foreground` `#0f172a`, `card`, `muted`, `border`, `secondary` | | surfaces & text |

Reference as Tailwind classes: `bg-primary`, `text-accent`, `border-success/25`, `bg-danger/10`, `text-muted-foreground`, etc.

### Typography

- **Vazirmatn** (`--font-vazir-matn`, via `.vazir-matn`) — primary Persian UI font. Weights 400/700/900.
- **DynaPuff** (`--font-dyna-puff`, via `.font-dyna`) — display/brand font (hero). Weights 400/500/700.
- **Geist Mono** (`--font-mono`) — numbers/prices (`font-mono`, `.text-price`, `.font-mono-nums`, `.stat-value`).
- Numeric font-weight utilities are used throughout: `font-500`, `font-600`, `font-700`, `font-800`. Small custom sizes: `text-2xs`.

### Reusable utility classes (in `globals.css`)

- **Cards:** `.card-elevated` (white card + subtle shadow), `.card-hover` (lift on hover).
- **Buttons:** `.btn-primary`, `.btn-secondary`.
- **Status badges:** `.status-active`, `.status-pending`, `.status-sold`, `.status-negotiable`, `.status-reserved`.
- **Misc:** `.section-label` (uppercase tracked label), `.stat-value`, `.filter-chip`, `.exchange-row` (hover row with RTL-aware inset bar), `.glass-card`, `.hero-gradient`, `.sticky-filters`, `.reveal-in` (entrance animation).
- The dark "spec highlight" pattern uses `bg-foreground` / slate gradients with `text-white` + `text-slate-400` labels (see `listings-detail/ListingDetailSpecs.tsx`).

### RTL & localization

- Set `dir="rtl"` on section roots. Remember horizontal directions flip (chevrons often need `rotate-180`; "previous" points right, "next" left).
- **Render all numbers in Persian digits.** Use `value.toLocaleString("fa-IR")`, or the `toFa()` digit-map helper for values without separators (e.g. years). See `context/listingTable.tsx`.
- **Dates** use the Persian (Jalali) calendar via `new Intl.DateTimeFormat("fa-IR", …)`.
- **Prices:** use `formatPrice` from `context/data.ts` (renders `… میلیارد` / `… میلیون`).
- English source data (brand, color, city, body type, fuel, seller) is mapped to Persian via label maps in `context/marketFilters.ts` / `context/listingTable.tsx`. Filtering compares against the mapped Persian label — keep maps in sync when adding data.

## Data model

`Listing` ([`src/types/dataTypes.ts`](src/types/dataTypes.ts)) is the central entity (brand/model/trim/year, color+colorHex, engine/transmission/fuel/bodyType, city, deliveryDays, seller fields, price, `status: "active" | "pending" | "sold" | "negotiable" | "reserved"`, market price fields, `trend7d`). The mock `listings` array and `formatPrice` live in `context/data.ts`. `FilterState` (marketplace filters) is in `types/marketplace.ts`.

## Known gotchas

- **Scroll reveal must be CSS-driven, not effect-driven.** On client-side **back navigation**, Next 16 restores the page from cache **without re-running client effects** — so any `whileInView` / `IntersectionObserver`-gated reveal stays stuck at its hidden initial state until a refresh. `shared/Reveal.tsx` therefore uses a pure-CSS `reveal-in` keyframe whose resting state is visible. Do not reintroduce effect-gated visibility for content.
- **No `Math.random()` / non-deterministic values during render** (hydration mismatch). Derive a stable value from the id instead (see `listingViews()` in `context/sellerDashboard.tsx`).
- **Listing detail is a server component** that `await`s `params` and looks the listing up by id (`notFound()` if missing). Get the id from props, not `useParams`.
- **`next/image` qualities** must be allowlisted in `next.config.ts` (`images.qualities`) for any non-default quality.
- Spell-checker flags Persian strings as "Unknown word" — ignore those diagnostics.
