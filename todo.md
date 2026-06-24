# ZeroMarket — Project TODO

Working backlog for ZeroMarket (زیرومارکت). The app is currently a **front-end-only
prototype**: every screen is wired to mock data in `src/context/`, there is no
backend, database, or real authentication. This file tracks what is needed to take
it from prototype to product.

**Legend:** 🔴 blocker · 🟠 high · 🟡 medium · 🟢 nice-to-have · ✅ done

---

## 1. Core infrastructure (no backend yet)

- 🔴 **Backend / API layer.** Replace the mock arrays in `src/context/` with a real
  data source (REST/GraphQL/server actions). Define the API contracts for listings,
  sellers, requests, and users.
- 🔴 **Authentication.** `auth/login` and `auth/signup` forms are UI-only — they don't
  submit, validate against a server, or create a session. Add real auth (sessions/JWT),
  protected routes, and role-based access (buyer vs. seller).
- 🟠 **Persisted state.** Saved listings, price alerts, notification prefs, and the
  "become a seller" application reset on refresh (local `useState`). Persist them
  (server, or at minimum `localStorage`) and lift to a shared store/context.
- 🟠 **Real images.** Listings have no photos — cards/detail use brand-initial tiles.
  Add an image model + gallery, wire `next/image` (`images.qualities` is already
  allowlisted in `next.config.ts`), and a placeholder/blur strategy.
- 🟡 **Dark theme.** `next-themes` is installed and a dark palette is commented out in
  `globals.css`. Finish the dark tokens and add a theme toggle.
- ✅ **Form library.** All data-entry forms now use `react-hook-form` + `zod`
  (`zodResolver`), with shared field schemas in `src/lib/validation.ts`.

## 2. Bugs & quick fixes

- 🟠 **Broken marketplace links on the listing page.** `ListingDetailContent.tsx`
  breadcrumb + "بازگشت" link to `/listings-marketplace`, which doesn't exist. The real
  route is `/market`. Fix all three occurrences.
- 🟡 **Non-functional action buttons.** On the listing detail page the share, report,
and "پیام" (message seller) buttons do nothing. Either wire them or hide them.
<!-- - 🟡 **Header search box.** Confirm `SearchBox` actually searches; if it's decorative,
  connect it to the marketplace search/filter state. -->
- ✅ **Static params for listing detail.** `market/listings/[id]` now exports
  `generateStaticParams` like the `sellers/[slug]` route for consistent pre-rendering.

## 3. Features to add

### Owner panel

- A panel that has access to anything in the website

### Admin panel

- The admin should be able to manage any seller or buyer that the owner has given them access to (both their profile and their dashboard)

### Buyer

- 🟠 Working **bookmark/save** flow shared between the listing detail heart button, the
  marketplace, and the user dashboard "saved listings" tab (one source of truth).
- 🟠 **Submit-request flow** end-to-end: the buyer's offer in `ListingAuctionModal`
  should appear in the buyer dashboard ("درخواست‌های من") and the seller dashboard.
- 🟡 **Price-alert creation** from a listing/market page (currently alerts only exist as
  mock data in the dashboard).
- 🟢 **Compare cars** side-by-side (the data model already has market price + trend).

### Seller

- 🟠 Make **New Post** and **Bulk Import** modals actually create listings that show up
  in the seller's listings tab and the marketplace.
- 🟡 Request management actions (approve / decline / negotiate) should persist and
  notify the buyer.
- 🟢 Seller onboarding: turn the "become a seller" application into a real review flow
  that flips the account role on approval.

### Marketplace & discovery

- 🟡 **Saved searches & filter persistence** (URL query params) so filters survive
  navigation and can be shared.
- 🟡 **Pagination / infinite scroll** for listings and the sellers directory.
- 🟢 **Map view** / city-based browsing.

### Notifications

- 🟡 Wire the header notification bell to a real feed (request replies, price alerts,
  saved-listing status changes — the categories already exist in notification prefs).

## 4. Pages & components to refactor / polish

- 🟡 **Extract shared dashboard primitives.** `StatsGrid`/`UserStatsGrid` and
  `DashboardTabs`/`UserDashboardTabs`/`ProfileTabs` are near-duplicates. Extract a
  single `<StatCard>` and a generic `<Tabs>` to remove the copy-paste.
- 🟡 **Reuse `ListingCard` everywhere.** The home "latest" table and the marketplace
  could share the new `shared/ListingCard` for visual consistency.
- 🟡 **Listing detail size.** `ListingDetailContent.tsx` is large; consider splitting the
  header/trust-banner into their own components (matches the "thin composition" rule).
- 🟢 **Empty/loading/error states.** Add `loading.tsx` / `error.tsx` per route segment
  and skeletons for data-driven views.
- 🟢 **Mobile pass.** Audit the dashboards, filters, and tables on small screens
  (horizontal scroll, drawer behavior).

## 5. Quality & ops

- 🟠 **Tests.** No test setup exists. Add unit tests for the data/label helpers
  (`carLabels`, `sellers`, `formatPrice`) and component tests for the key flows.
- 🟡 **Accessibility.** Audit focus order, keyboard nav for modals/menus, `aria` labels,
  and color contrast across the RTL UI.
- 🟡 **SEO / metadata.** Add per-route `metadata` (titles, descriptions, Open Graph),
  especially for listing and seller pages.
- 🟢 **Analytics & error monitoring** before launch.
- 🟢 **CI** (lint + typecheck + build) on push.

---

## Recently completed ✅

- User profile + settings page (`/user-profile`) with personal info, security,
  notifications, and a "become a seller" upgrade flow.
- Buyer dashboard (`/dashboard/user`) — saved listings, my requests, price alerts.
- Sellers directory (`/sellers`) with search + a single seller profile
  (`/sellers/[slug]`) listing each seller's posts.
- "Related cars / other sellers" grid on the listing detail page.
- Shared `ListingCard` + extracted Persian label maps into `context/carLabels.ts`.
