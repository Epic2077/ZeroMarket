# KhodroJu — Project TODO

Working backlog for KhodroJu (خودروجو). The app is still a front-end prototype
with mock data in `src/context/`, so this list focuses on what should be cleaned up
before the backend is introduced.

**Priority legend:** `[p0]` must do before backend work, `[p1]` should do before the
first backend pass, `✅` already done.

## 1. P0 — unblock backend work

- [p0] Normalize the domain model before wiring APIs.
  - Stop deriving sellers, admins, and viewer state from unrelated mock arrays.
  - Introduce one front-end adapter layer for `listing`, `seller`, `user`, and `session` view models so the UI has one source of truth.
  - Refactor `Listing` so seller data is relation-shaped instead of duplicated on every record.
- [p0] Replace the mock session model with one auth/session boundary.
  - Remove hardcoded owner/admin viewer defaults and hardcoded ids.
  - Make public, buyer, seller, admin, and owner screens consume the same session API so backend permissions map cleanly later.
- [p0] Fix route drift and navigation holes.
  - Replace `/listings-marketplace` and `#` placeholders with shared route constants.
  - Standardize the dashboard and auth route names so future redirects and protected routes do not have to support legacy paths.
- [p0] Centralize labels, taxonomy, and filter vocabulary.
  - Merge overlapping brand/body/city/fuel/seller label maps into one shared vocabulary layer or a thin adapter on top of it.
  - Make marketplace filters and backend query params read from the same vocabulary.
- [p0] Separate UI definitions from mock records.
  - Keep table columns, cards, and forms in components.
  - Move seed/demo data out of files that also contain presentation logic, especially the dashboard and marketplace contexts.
- [p0] Make all data-driven pages consume one lookup contract.
  - Marketplace, listing detail, sellers, dashboards, and admin views should all use the same fetch/lookup helpers instead of reading raw arrays directly.
- [p0] Remove auth and CTA dead ends.
  - Convert login/signup cross-links, forgot-password, terms, privacy, and similar placeholder anchors to real routes or explicit disabled states.

## 2. P1 — make the first backend pass cleaner

- [p1] Add persistence-ready boundaries for user state.
  - Move saved listings, price alerts, notification prefs, request state, and seller onboarding behind one shared store or API facade.
- [p1] Prepare media support.
  - Add a listing image model and placeholder strategy so the backend can attach images without redesigning cards and detail views later.
- [p1] Make filtering and search URL-driven.
  - Persist marketplace filters in query params so the state is shareable and back/forward navigation behaves correctly.
- [p1] Add loading, empty, and error states to data-heavy routes.
  - Cover marketplace, listing detail, sellers, dashboards, and auth screens.
- [p1] Extract shared dashboard primitives.
  - Consolidate repeated stat cards, tabs, and table shells across admin, owner, seller, and user surfaces.
- [p1] Wire the currently fake forms to real submit behavior.
  - Login, signup, listing creation, bulk import, save/unsave, request submission, and profile settings should be ready to swap to API calls.
- [p1] Add route-level metadata and accessibility cleanup.
  - Prepare titles, descriptions, keyboard-safe interactions, and ARIA labels before backend data increases the number of interactive states.
- [p1] Add test coverage for the shared data helpers.
  - Cover label mapping, formatters, route helpers, and any adapter functions created for the migration.

## 3. Bugs & quick fixes

- [p1] Broken marketplace links on the listing page still need cleanup everywhere they appear.
- [p1] Non-functional action buttons on listing detail should either be wired or hidden.

## 4. Features to add

### Buyer

- [p1] Working bookmark/save flow shared between the listing detail heart button, the marketplace, and the user dashboard "saved listings" tab.
- [p1] Submit-request flow end-to-end so the buyer's offer appears in both buyer and seller dashboards.
- [p1] Price-alert creation from a listing or market page.
- [p1] Compare cars side-by-side.

### Seller

- [p1] Make New Post and Bulk Import modals actually create listings that show up in the seller's listings tab and the marketplace.
- [p1] Request management actions should persist and notify the buyer.
- [p1] Seller onboarding should become a real review flow that flips the account role on approval.

### Marketplace & discovery

- [p1] Saved searches and filter persistence through URL query params.
- [p1] Pagination or infinite scroll for listings and the sellers directory.
- [p1] Map view or city-based browsing.

### Notifications

- [p1] Wire the header notification bell to a real feed for request replies, price alerts, and saved-listing changes.

## 5. Quality & ops

- [p1] Add unit tests for `carLabels`, `sellers`, and `formatPrice`, plus component tests for the key flows.
- [p1] Audit focus order, keyboard navigation, ARIA labels, and color contrast across the RTL UI.
- [p1] Add per-route metadata, especially for listing and seller pages.
- [p1] Add analytics and error monitoring before launch.
- [p1] Add CI for lint, typecheck, and build on push.

---

## Recently completed ✅

- **Owner panel** (`/dashboard/owner`) — full platform access: overview stats,
  searchable user directory, view any user's full info + analytics, explicit role
  changes (make buyer / seller / confirmed seller), suspend/activate accounts, a global
  post catalog (edit/delete), per-user post CRUD, **bulk Excel import for sellers**,
  profile editing, **add/remove admins** + assign users to them, and an **editable
  taxonomy** (brands, years, colors, cities, body/fuel/transmission) that drives the
  post-form selects. Buyers can't have posts. Backed by `AdminProvider` + `TaxonomyProvider`.
- **Admin panel** (`/dashboard/admin`) — scoped to the signed-in admin's assigned
  users; can view full info/analytics, edit profiles + posts (incl. bulk import), and
  manage the shared taxonomy — but not roles, status, or admin management (owner-only).
  State is shared with the owner panel via the dashboard layout.
- User profile + settings page (`/user-profile`) with personal info, security,
  notifications, and a "become a seller" upgrade flow.
- Buyer dashboard (`/dashboard/user`) — saved listings, my requests, price alerts.
- Sellers directory (`/sellers`) with search + a single seller profile
  (`/sellers/[slug]`) listing each seller's posts.
- "Related cars / other sellers" grid on the listing detail page.
- Shared `ListingCard` + extracted Persian label maps into `context/carLabels.ts`.
