Performance Optimization Plan: 80 → 100 (All Scores to 100)
Root Cause Analysis
Page Current Pattern Problem
Home (/) Client hooks fetch ALL listings + sellers + taxonomy No pagination, all data transferred to client
Marketplace (/market) Client hooks fetch ALL listings + taxonomy Client-side filtering after full fetch
Sellers (/sellers) Client hook fetches ALL sellers Client-side search/sort/filter
Listing Detail Server Component ✓ Already optimal
Phase 1: Server Components + Streaming (Biggest Impact)
Home Page (src/app/page.tsx)

- Convert to Server Component (remove "use client" from section components)
- Fetch only 8 latest listings in page.tsx via fetchListings({ status: ["AVAILABLE", "NEGOTIABLE"] }) with .limit(8)
- Fetch 4 verified sellers via fetchSellers() with filter + limit
- Fetch taxonomy once (cache with revalidate: 3600)
- Wrap each section in <Suspense> for streaming
  Marketplace (src/app/market/page.tsx)
- Convert MarketplaceContent to Server Component
- Accept searchParams as prop, parse filters server-side
- Use fetchListings(filter) with pagination (.range(0, 19))
- Return total count for pagination UI
- Client component only for interactive filters (debounced URL updates)
  Sellers Directory (src/app/sellers/page.tsx)
- Server Component fetching paginated sellers (20 per page)
- Server-side search/filter/sort via query params
- Client component only for instant filter UI (debounced navigation)
  Phase 2: Caching Strategy
  Data Cache Strategy
  Listings (home/market) fetch(..., { next: { revalidate: 60, tags: ['listings'] } })
  Sellers fetch(..., { next: { revalidate: 300, tags: ['sellers'] } })
  Taxonomy fetch(..., { next: { revalidate: 3600 } }) - rarely changes
  Market insights fetch(..., { next: { revalidate: 300 } })
  Listing detail fetch(..., { next: { revalidate: 60 } })
  Use revalidateTag('listings') on mutations (create/update/delete).
  Phase 3: Image Optimization
  next.config.ts - Add:
  images: {
  remotePatterns: [...],
  qualities: [25, 50, 75, 100], // Allowlist for next/image quality prop
  formats: ['image/avif', 'image/webp'],
  }
  All <Image> components - Add sizes, priority for above-fold, loading="lazy" for below.
  Phase 4: Bundle Size Reduction
  Component Action
  Charts (InsightChart, MarketAnalytics, PriceScatter) dynamic(() => import(...), { ssr: false })
  Modals (ShareListingModal, ReportListingModal, BulkImportModal) Dynamic import
  Heavy UI (MarketPlaceFilters, MarketplaceSidebar) Move filtering logic to server, keep only UI client
  useListings/useSellers hooks Delete - replace with server data + useSearchParams for filters
  Phase 5: Accessibility (88 → 100)

1. Semantic HTML: <main>, <section>, <article> properly nested
2. Focus management: focus-trap in modals, restore focus on close
3. ARIA: aria-live for filter results, aria-expanded on dropdowns
4. Color contrast: Verify all text meets WCAG AA (4.5:1)
5. Keyboard nav: All interactive elements reachable, visible focus rings
6. Headings: Proper h1-h6 hierarchy (no skipped levels)
   Phase 6: Best Practices (98 → 100)
7. Error boundaries per feature section
8. Security headers via next.config.ts:
   async headers() {
   return [{ source: '/:path\*', headers: [
   { key: 'X-Content-Type-Options', value: 'nosniff' },
   { key: 'X-Frame-Options', value: 'DENY' },
   { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
   ]}]
   }
9. Remove unused deps: @heroicons/react, html2canvas (if unused)
   Phase 7: SEO (Maintain 100)

- Already good: generateMetadata on listing detail
- Add generateMetadata to marketplace/sellers with dynamic titles
- Add structured data (JSON-LD) for VehicleListing, AutoDealer
  Implementation Priority
  Priority Task Est. Impact
  1 Home page → Server Component + limited fetch +15 Perf
  2 Marketplace → Server Component + server filtering +15 Perf
  3 Sellers → Server Component + pagination +10 Perf
  4 Image optimization config +5 Perf
  5 Dynamic imports for heavy components +5 Perf
  6 Caching headers + revalidation +5 Perf
  7 Accessibility audit + fixes +12 A11y
  8 Error boundaries + security headers +2 Best Practices
